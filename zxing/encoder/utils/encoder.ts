/**
 * @module encoder
 */

import { Mode } from '/common/Mode';
import { toUInt32 } from '/common/utils';
import { Charset } from '/common/Charset';
import { ECLevel } from '/common/ECLevel';
import { BitArray } from '/common/BitArray';
import { Byte } from '/encoder/segments/Byte';
import { BlockPair } from '/encoder/BlockPair';
import { Kanji } from '/encoder/segments/Kanji';
import { Numeric } from '/encoder/segments/Numeric';
import { Version, VERSIONS } from '/common/Version';
import { Alphanumeric } from '/encoder/segments/Alphanumeric';
import { Encoder as ReedSolomonEncoder } from '/common/reedsolomon/Encoder';

export interface SegmentBlock {
  mode: Mode;
  length: number;
  dataBits: BitArray;
  headerBits: BitArray;
}

export type EncodeHint = 'GS1_FORMAT' | 'CHARACTER_SET';

export type Segment = Alphanumeric | Byte | Kanji | Numeric;

function getNumECAndDataBytes(
  blockID: number,
  numRSBlocks: number,
  numDataBytes: number,
  numTotalBytes: number
): [numECBytesInBlock: number, numDataBytesInBlock: number] {
  if (blockID >= numRSBlocks) {
    throw new Error('block id too large');
  }

  // numRSBlocksInGroup2 = 196 % 5 = 1
  const numRSBlocksInGroup2 = numTotalBytes % numRSBlocks;
  // numRSBlocksInGroup1 = 5 - 1 = 4
  const numRSBlocksInGroup1 = numRSBlocks - numRSBlocksInGroup2;
  // numTotalBytesInGroup1 = 196 / 5 = 39
  const numTotalBytesInGroup1 = toUInt32(numTotalBytes / numRSBlocks);
  // numTotalBytesInGroup2 = 39 + 1 = 40
  const numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
  // numDataBytesInGroup1 = 66 / 5 = 13
  const numDataBytesInGroup1 = toUInt32(numDataBytes / numRSBlocks);
  // numDataBytesInGroup2 = 13 + 1 = 14
  const numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
  // numECBytesInGroup1 = 39 - 13 = 26
  const numECBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
  // numECBytesInGroup2 = 40 - 14 = 26
  const numECBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;

  // Sanity checks.
  // 26 = 26
  if (numECBytesInGroup1 !== numECBytesInGroup2) {
    throw new Error('ec bytes mismatch');
  }

  // 5 = 4 + 1.
  if (numRSBlocks !== numRSBlocksInGroup1 + numRSBlocksInGroup2) {
    throw new Error('rs blocks mismatch');
  }

  // 196 = (13 + 26) * 4 + (14 + 26) * 1
  if (
    numTotalBytes !==
    (numDataBytesInGroup1 + numECBytesInGroup1) * numRSBlocksInGroup1 +
      (numDataBytesInGroup2 + numECBytesInGroup2) * numRSBlocksInGroup2
  ) {
    throw new Error('total bytes mismatch');
  }

  if (blockID < numRSBlocksInGroup1) {
    return [numECBytesInGroup1, numDataBytesInGroup1];
  } else {
    return [numECBytesInGroup2, numDataBytesInGroup2];
  }
}

function generateECBytes(dataBytes: Int8Array, numECBytesInBlock: number): Int8Array {
  const numDataBytes = dataBytes.length;
  const ecBytes = new Int8Array(numECBytesInBlock);
  const toEncode = new Int32Array(numDataBytes + numECBytesInBlock);

  toEncode.set(dataBytes);

  new ReedSolomonEncoder().encode(toEncode, numECBytesInBlock);

  ecBytes.set(toEncode.subarray(numDataBytes));

  return ecBytes;
}

export function interleaveWithECBytes(
  bits: BitArray,
  numRSBlocks: number,
  numDataBytes: number,
  numTotalBytes: number
): BitArray {
  // "bits" must have "getNumDataBytes" bytes of data.
  if (bits.byteLength !== numDataBytes) {
    throw new Error('number of bits and data bytes does not match');
  }

  // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
  // store the divided data bytes blocks and error correction bytes blocks into "blocks".
  let maxNumEcBytes = 0;
  let maxNumDataBytes = 0;
  let dataBytesOffset = 0;

  // Since, we know the number of reedsolmon blocks, we can initialize the vector with the number.
  const blocks: BlockPair[] = [];

  for (let i = 0; i < numRSBlocks; ++i) {
    const [numECBytesInBlock, numDataBytesInBlock] = getNumECAndDataBytes(i, numRSBlocks, numDataBytes, numTotalBytes);
    const dataBytes = new Int8Array(numDataBytesInBlock);

    bits.toBytes(8 * dataBytesOffset, dataBytes, 0, numDataBytesInBlock);

    const ecBytes = generateECBytes(dataBytes, numECBytesInBlock);

    blocks.push(new BlockPair(dataBytes, ecBytes));

    maxNumDataBytes = Math.max(maxNumDataBytes, numDataBytesInBlock);
    maxNumEcBytes = Math.max(maxNumEcBytes, ecBytes.length);
    dataBytesOffset += numDataBytesInBlock;
  }

  if (numDataBytes !== dataBytesOffset) {
    throw new Error('data bytes does not match offset');
  }

  const array = new BitArray();

  // First, place data blocks.
  for (let i = 0; i < maxNumDataBytes; ++i) {
    for (const { dataBytes } of blocks) {
      if (i < dataBytes.length) {
        array.append(dataBytes[i], 8);
      }
    }
  }

  // Then, place error correction blocks.
  for (let i = 0; i < maxNumEcBytes; ++i) {
    for (const { ecBytes } of blocks) {
      if (i < ecBytes.length) {
        array.append(ecBytes[i], 8);
      }
    }
  }

  if (numTotalBytes !== array.byteLength) {
    // Should be same.
    throw new Error(`interleaving error: ${numTotalBytes} and ${array.byteLength} differ`);
  }

  return array;
}

export function terminateBits(bits: BitArray, numDataBytes: number): void {
  const capacity = numDataBytes * 8;

  // if (bits.length > capacity) {
  //   throw new Error(`data bits cannot fit in the QRCode ${bits.length} > ${capacity}`);
  // }

  // Append Mode.TERMINATE if there is enough space (value is 0000)
  for (let i = 0; i < 4 && bits.length < capacity; i++) {
    bits.append(0);
  }

  // Append termination bits. See 8.4.8 of JISX0510:2004 (p.24) for details.
  // If the last byte isn't 8-bit aligned, we'll add padding bits.
  const numBitsInLastByte = bits.length & 0x07;

  if (numBitsInLastByte > 0) {
    for (let i = numBitsInLastByte; i < 8; i++) {
      bits.append(0);
    }
  }

  // If we have more space, we'll fill the space with padding patterns defined in 8.4.9 (p.24).
  const numPaddingBytes = numDataBytes - bits.byteLength;

  for (let i = 0; i < numPaddingBytes; i++) {
    bits.append((i & 0x01) === 0 ? 0xec : 0x11, 8);
  }

  if (bits.length !== capacity) {
    throw new Error('bits size does not equal capacity');
  }
}

export function isByteMode(segment: Segment): segment is Byte {
  return segment.mode === Mode.BYTE;
}

export function appendModeInfo(bits: BitArray, mode: Mode): void {
  bits.append(mode.bits, 4);
}

export function appendECI(bits: BitArray, mode: Mode, charset: Charset): void {
  appendModeInfo(bits, mode);

  bits.append(charset.values[0], 8);
}

export function appendLengthInfo(bits: BitArray, version: Version, mode: Mode, numLetters: number): void {
  const numBits = mode.getCharacterCountBits(version);

  if (numLetters >= 1 << numBits) {
    throw new Error(`${numLetters} is bigger than ${(1 << numBits) - 1}`);
  }

  bits.append(numLetters, numBits);
}

export function willFit(numInputBits: number, version: Version, ecLevel: ECLevel): boolean {
  // In the following comments, we use numbers of Version 7-H.
  // numBytes = 196
  const numBytes = version.totalCodewords;
  const ecBlocks = version.getECBlocksForECLevel(ecLevel);
  // numECBytes = 130
  const numECBytes = ecBlocks.totalECCodewords;
  // numDataBytes = 196 - 130 = 66
  const numDataBytes = numBytes - numECBytes;
  const totalInputBytes = (numInputBits + 7) / 8;

  return numDataBytes >= totalInputBytes;
}

function chooseVersion(numInputBits: number, ecLevel: ECLevel): Version {
  for (const version of VERSIONS) {
    if (willFit(numInputBits, version, ecLevel)) {
      return version;
    }
  }

  throw new Error('data too big');
}

export function calculateBitsNeeded(segmentBlocks: SegmentBlock[], version: Version): number {
  let bitsNeeded = 0;

  for (const { mode, headerBits, dataBits } of segmentBlocks) {
    bitsNeeded += headerBits.length + mode.getCharacterCountBits(version) + dataBits.length;
  }

  return bitsNeeded;
}

export function recommendVersion(segmentBlocks: SegmentBlock[], ecLevel: ECLevel): Version {
  // Hard part: need to know version to know how many bits length takes. But need to know how many
  // bits it takes to know version. First we take a guess at version by assuming version will be
  // the minimum, 1:
  const provisionalBitsNeeded = calculateBitsNeeded(segmentBlocks, VERSIONS[1]);
  const provisionalVersion = chooseVersion(provisionalBitsNeeded, ecLevel);
  // Use that guess to calculate the right version. I am still not sure this works in 100% of cases.
  const bitsNeeded = calculateBitsNeeded(segmentBlocks, provisionalVersion);

  return chooseVersion(bitsNeeded, ecLevel);
}
