/**
 * @module encoder
 */

import { Mode } from '/common/Mode';
import { buildMatrix } from './matrix';
import { FNC1 } from '/common/interface';
import { ECLevel } from '/common/ECLevel';
import { BitArray } from '/common/BitArray';
import { ECBlocks } from '/common/ECBlocks';
import { Byte } from '/encoder/segments/Byte';
import { BlockPair } from '/encoder/BlockPair';
import { ByteMatrix } from '/common/ByteMatrix';
import { Hanzi } from '/encoder/segments/Hanzi';
import { Kanji } from '/encoder/segments/Kanji';
import { Numeric } from '/encoder/segments/Numeric';
import { Version, VERSIONS } from '/common/Version';
import { calculateMaskPenalty } from '/common/mask';
import { Alphanumeric } from '/encoder/segments/Alphanumeric';
import { Encoder as ReedSolomonEncoder } from '/common/reedsolomon/Encoder';

export interface Hints {
  fnc1?: FNC1;
}

export interface SegmentBlock {
  mode: Mode;
  head: BitArray;
  data: BitArray;
  length: number;
}

export type Segment = Alphanumeric | Byte | Hanzi | Kanji | Numeric;

function generateECCodewords(codewords: Uint8Array, numECCodewords: number): Uint8Array {
  const numDataCodewords = codewords.length;
  const buffer = new Int32Array(numDataCodewords + numECCodewords);

  // Copy data codewords.
  buffer.set(codewords);

  // Reed solomon encode.
  new ReedSolomonEncoder().encode(buffer, numECCodewords);

  // Get ec codewords.
  return new Uint8Array(buffer.subarray(numDataCodewords));
}

export function injectECCodewords(bits: BitArray, { ecBlocks, numECCodewordsPerBlock }: ECBlocks): BitArray {
  // Step 1.  Divide data bytes into blocks and generate error correction bytes for them. We'll
  // store the divided data bytes blocks and error correction bytes blocks into "blocks".
  let maxNumECCodewords = 0;
  let maxNumDataCodewords = 0;
  let dataCodewordsOffset = 0;

  // Block pair.
  const blocks: BlockPair[] = [];

  for (const { count, numDataCodewords } of ecBlocks) {
    for (let i = 0; i < count; i++) {
      const dataCodewords = new Uint8Array(numDataCodewords);

      bits.toUint8Array(dataCodewordsOffset * 8, dataCodewords, 0, numDataCodewords);

      const ecCodewords = generateECCodewords(dataCodewords, numECCodewordsPerBlock);

      blocks.push(new BlockPair(dataCodewords, ecCodewords));

      dataCodewordsOffset += numDataCodewords;
      maxNumECCodewords = Math.max(maxNumECCodewords, ecCodewords.length);
      maxNumDataCodewords = Math.max(maxNumDataCodewords, numDataCodewords);
    }
  }

  const codewords = new BitArray();

  // First, place data blocks.
  for (let i = 0; i < maxNumDataCodewords; i++) {
    for (const { dataCodewords } of blocks) {
      if (i < dataCodewords.length) {
        codewords.append(dataCodewords[i], 8);
      }
    }
  }

  // Then, place error correction blocks.
  for (let i = 0; i < maxNumECCodewords; i++) {
    for (const { ecCodewords } of blocks) {
      if (i < ecCodewords.length) {
        codewords.append(ecCodewords[i], 8);
      }
    }
  }

  return codewords;
}

export function appendTerminator(bits: BitArray, numDataCodewords: number): void {
  const capacity = numDataCodewords * 8;

  // Append terminator if there is enough space (value is 0000).
  for (let i = 0; i < 4 && bits.length < capacity; i++) {
    bits.append(0);
  }

  // Append terminator. See 7.4.9 of ISO/IEC 18004:2015(E)(p.32) for details.
  // If the last byte isn't 8-bit aligned, we'll add padding bits.
  const numBitsInLastByte = bits.length & 0x07;

  if (numBitsInLastByte > 0) {
    for (let i = numBitsInLastByte; i < 8; i++) {
      bits.append(0);
    }
  }

  // If we have more space, we'll fill the space with padding patterns defined in 8.4.9 (p.24).
  const numPaddingCodewords = numDataCodewords - bits.byteLength;

  for (let i = 0; i < numPaddingCodewords; i++) {
    bits.append(i & 0x01 ? 0x11 : 0xec, 8);
  }
}

export function isByteMode(segment: Segment): segment is Byte {
  return segment.mode === Mode.BYTE;
}

export function isHanziMode(segment: Segment): segment is Hanzi {
  return segment.mode === Mode.HANZI;
}

export function appendModeInfo(bits: BitArray, mode: Mode): void {
  bits.append(mode.bits, 4);
}

export function appendECI(bits: BitArray, segment: Segment, currentECIValue: number): number {
  if (isByteMode(segment)) {
    const [value] = segment.charset.values;

    if (value !== currentECIValue) {
      bits.append(Mode.ECI.bits, 4);

      if (value < 1 << 7) {
        bits.append(value, 8);
      } else if (value < 1 << 14) {
        bits.append(2, 2);
        bits.append(value, 14);
      } else {
        bits.append(6, 3);
        bits.append(value, 21);
      }

      return value;
    }
  }

  return currentECIValue;
}

export function appendFNC1Info(bits: BitArray, fnc1: FNC1): void {
  const [mode, indicator] = fnc1;

  // Append FNC1 if applicable.
  switch (mode) {
    case 'GS1':
      // GS1 formatted codes are prefixed with a FNC1 in first position mode header.
      appendModeInfo(bits, Mode.FNC1_FIRST_POSITION);

      break;
    case 'AIM':
      // AIM formatted codes are prefixed with a FNC1 in first position mode header.
      appendModeInfo(bits, Mode.FNC1_SECOND_POSITION);

      // Append AIM application indicator.
      bits.append(indicator, 8);

      break;
  }
}

export function appendLengthInfo(bits: BitArray, mode: Mode, version: Version, numLetters: number): void {
  bits.append(numLetters, mode.getCharacterCountBits(version));
}

export function willFit(numInputBits: number, version: Version, ecLevel: ECLevel): boolean {
  // In the following comments, we use numbers of Version 7-H.
  const ecBlocks = version.getECBlocks(ecLevel);
  const numInputCodewords = Math.ceil(numInputBits / 8);

  return ecBlocks.numTotalDataCodewords >= numInputCodewords;
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

  for (const { mode, head, data } of segmentBlocks) {
    bitsNeeded += head.length + mode.getCharacterCountBits(version) + data.length;
  }

  return bitsNeeded;
}

export function recommendVersion(segmentBlocks: SegmentBlock[], ecLevel: ECLevel): Version {
  // Hard part: need to know version to know how many bits length takes. But need to know how many
  // bits it takes to know version. First we take a guess at version by assuming version will be
  // the minimum, 1:
  const provisionalBitsNeeded = calculateBitsNeeded(segmentBlocks, VERSIONS[0]);
  const provisionalVersion = chooseVersion(provisionalBitsNeeded, ecLevel);
  // Use that guess to calculate the right version. I am still not sure this works in 100% of cases.
  const bitsNeeded = calculateBitsNeeded(segmentBlocks, provisionalVersion);

  return chooseVersion(bitsNeeded, ecLevel);
}

export function chooseBestMask(matrix: ByteMatrix, bits: BitArray, version: Version, ecLevel: ECLevel): number {
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
