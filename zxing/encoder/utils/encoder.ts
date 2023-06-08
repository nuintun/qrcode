/**
 * @module encoder
 */

import { Mode } from '/common/Mode';
import { buildMatrix } from './matrix';
import { Charset } from '/common/Charset';
import { ECLevel } from '/common/ECLevel';
import { BitArray } from '/common/BitArray';
import { Byte } from '/encoder/segments/Byte';
import { calculateMaskPenalty } from './mask';
import { BlockPair } from '/encoder/BlockPair';
import { Kanji } from '/encoder/segments/Kanji';
import { ByteMatrix } from '/encoder/ByteMatrix';
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

function getNumBytesInBlock(
  blockID: number,
  numRSBlocks: number,
  numDataBytes: number,
  numTotalBytes: number
): [numECBytesInBlock: number, numDataBytesInBlock: number] {
  // numRSBlocksInGroup2 = 196 % 5 = 1
  const numRSBlocksInGroup2 = numTotalBytes % numRSBlocks;
  // numRSBlocksInGroup1 = 5 - 1 = 4
  const numRSBlocksInGroup1 = numRSBlocks - numRSBlocksInGroup2;
  // numTotalBytesInGroup1 = 196 / 5 = 39
  const numTotalBytesInGroup1 = Math.floor(numTotalBytes / numRSBlocks);
  // numTotalBytesInGroup2 = 39 + 1 = 40
  const numTotalBytesInGroup2 = numTotalBytesInGroup1 + 1;
  // numDataBytesInGroup1 = 66 / 5 = 13
  const numDataBytesInGroup1 = Math.floor(numDataBytes / numRSBlocks);
  // numDataBytesInGroup2 = 13 + 1 = 14
  const numDataBytesInGroup2 = numDataBytesInGroup1 + 1;
  // numECBytesInGroup1 = 39 - 13 = 26
  const numECBytesInGroup1 = numTotalBytesInGroup1 - numDataBytesInGroup1;
  // numECBytesInGroup2 = 40 - 14 = 26
  const numECBytesInGroup2 = numTotalBytesInGroup2 - numDataBytesInGroup2;

  // Sanity checks: /zxing/qrcode/encoder/Encoder.java -> getNumDataBytesAndNumECBytesForBlockID

  if (blockID < numRSBlocksInGroup1) {
    return [numECBytesInGroup1, numDataBytesInGroup1];
  } else {
    return [numECBytesInGroup2, numDataBytesInGroup2];
  }
}

function generateECBytes(dataBytes: Uint8Array, numECBytesInBlock: number): Uint8Array {
  const numDataBytes = dataBytes.length;
  const ecBytes = new Uint8Array(numECBytesInBlock);
  const toEncode = new Int32Array(numDataBytes + numECBytesInBlock);

  // Append data bytes
  toEncode.set(dataBytes);

  // Append ec code
  new ReedSolomonEncoder().encode(toEncode, numECBytesInBlock);

  // Get ec bytes
  ecBytes.set(toEncode.subarray(numDataBytes));

  return ecBytes;
}

export function injectECBytes(bits: BitArray, numRSBlocks: number, numDataBytes: number, numTotalBytes: number): BitArray {
  // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
  // store the divided data bytes blocks and error correction bytes blocks into "blocks".
  let maxNumECBytes = 0;
  let maxNumDataBytes = 0;
  let dataBytesOffset = 0;

  // Since, we know the number of reedsolmon blocks, we can initialize the vector with the number.
  const blocks: BlockPair[] = [];

  for (let i = 0; i < numRSBlocks; i++) {
    const [numECBytesInBlock, numDataBytesInBlock] = getNumBytesInBlock(i, numRSBlocks, numDataBytes, numTotalBytes);
    const dataBytes = new Uint8Array(numDataBytesInBlock);

    bits.toUint8Array(8 * dataBytesOffset, dataBytes, 0, numDataBytesInBlock);

    const ecBytes = generateECBytes(dataBytes, numECBytesInBlock);

    blocks.push(new BlockPair(dataBytes, ecBytes));

    maxNumDataBytes = Math.max(maxNumDataBytes, numDataBytesInBlock);
    maxNumECBytes = Math.max(maxNumECBytes, ecBytes.length);
    dataBytesOffset += numDataBytesInBlock;
  }

  const result = new BitArray();

  // First, place data blocks.
  for (let i = 0; i < maxNumDataBytes; i++) {
    for (const { dataBytes } of blocks) {
      if (i < dataBytes.length) {
        result.append(dataBytes[i], 8);
      }
    }
  }

  // Then, place error correction blocks.
  for (let i = 0; i < maxNumECBytes; i++) {
    for (const { ecBytes } of blocks) {
      if (i < ecBytes.length) {
        result.append(ecBytes[i], 8);
      }
    }
  }

  return result;
}

export function appendTerminateBits(bits: BitArray, numDataBytes: number): void {
  const capacity = numDataBytes * 8;

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
    bits.append(i & 1 ? 0x11 : 0xec, 8);
  }
}

export function isByteMode(segment: Segment): segment is Byte {
  return segment.mode === Mode.BYTE;
}

export function appendModeInfo(bits: BitArray, mode: Mode): void {
  bits.append(mode.bits, 4);
}

export function appendECI(bits: BitArray, charset: Charset): void {
  bits.append(Mode.ECI.bits, 4);

  const [encoding] = charset.values;

  if (encoding < 1 << 7) {
    bits.append(encoding, 8);
  } else if (encoding < 1 << 14) {
    bits.append(2, 2);
    bits.append(encoding, 14);
  } else {
    bits.append(6, 3);
    bits.append(encoding, 21);
  }
}

export function appendLengthInfo(bits: BitArray, mode: Mode, version: Version, numLetters: number): void {
  bits.append(numLetters, mode.getCharacterCountBits(version));
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

  throw new Error('data too big for all versions');
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

export function chooseMask(matrix: ByteMatrix, bits: BitArray, version: Version, ecLevel: ECLevel): number {
  let bestMask = -1;
  // Lower penalty is better.
  let minPenalty = Number.MAX_VALUE;

  // We try all mask patterns to choose the best one.
  for (let mask = 0; mask < 8; mask++) {
    buildMatrix(matrix, bits, version, ecLevel, mask);

    const penalty = calculateMaskPenalty(matrix);

    if (penalty < minPenalty) {
      bestMask = mask;
      minPenalty = penalty;
    }
  }

  return bestMask;
}
