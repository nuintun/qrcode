/**
 * @module BitMatrixParser
 */

import { DataBlock } from './DataBlock';
import { ECLevel } from '/common/ECLevel';
import { isApplyMask } from '/common/mask';
import { BitMatrix } from '/common/BitMatrix';
import { decodeFormatInfo, FormatInfo } from './FormatInfo';
import { Decoder as ReedSolomonDecoder } from '/common/reedsolomon/Decoder';
import { buildFunctionPattern, decodeVersion, Version, VERSIONS } from '/common/Version';

export function getDataBlocks(codewords: Uint8Array, version: Version, ecLevel: ECLevel): DataBlock[] {
  if (codewords.length !== version.totalCodewords) {
    throw new Error('failed to get data blocks');
  }

  const blocks: DataBlock[] = [];
  const { ecBlocks, ecCodewordsPerBlock } = version.getECBlocks(ecLevel);

  // Now establish DataBlocks of the appropriate size and number of data codewords
  for (const { count, dataCodewords } of ecBlocks) {
    for (let i = 0; i < count; i++) {
      const numBlockCodewords = ecCodewordsPerBlock + dataCodewords;

      blocks.push(new DataBlock(new Uint8Array(numBlockCodewords), dataCodewords));
    }
  }

  const { length } = blocks;

  // All blocks have the same amount of data, except that the last n
  // (where n may be 0) have 1 more byte. Figure out where these start.
  let longerBlocksStartAt = length - 1;

  const shorterBlocksTotalCodewords = blocks[0].codewords.length;

  while (longerBlocksStartAt >= 0) {
    const numCodewords = blocks[longerBlocksStartAt].codewords.length;

    if (numCodewords === shorterBlocksTotalCodewords) {
      break;
    }

    longerBlocksStartAt--;
  }

  longerBlocksStartAt++;

  // The last elements of result may be 1 element longer;
  // first fill out as many elements as all of them have
  let codewordsOffset = 0;

  const shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecCodewordsPerBlock;

  for (let i = 0; i < shorterBlocksNumDataCodewords; i++) {
    for (let j = 0; j < length; j++) {
      blocks[j].codewords[i] = codewords[codewordsOffset++];
    }
  }

  // Fill out the last data block in the longer ones
  for (let j = longerBlocksStartAt; j < length; j++) {
    blocks[j].codewords[shorterBlocksNumDataCodewords] = codewords[codewordsOffset++];
  }

  // Now add in error correction blocks
  const max = blocks[0].codewords.length;

  for (let i = shorterBlocksNumDataCodewords; i < max; i++) {
    for (let j = 0; j < length; j++) {
      const offset = j < longerBlocksStartAt ? i : i + 1;

      blocks[j].codewords[offset] = codewords[codewordsOffset++];
    }
  }

  return blocks;
}

export function correctErrors(bytes: Uint8Array, numDataBytes: number): Uint8Array {
  // First read into an array of ints
  const toDecode = new Int32Array(bytes);
  const ecBytes = bytes.length - numDataBytes;

  new ReedSolomonDecoder().decode(toDecode, ecBytes);

  return new Uint8Array(toDecode.subarray(0, numDataBytes));
}

export class BitMatrixParser {
  #matrix: BitMatrix;

  constructor(matrix: BitMatrix) {
    const { size } = matrix;

    if (size < 21 || (size & 0x03) !== 1) {
      throw new Error('illegal qrcode dimension');
    }

    this.#matrix = matrix;
  }

  #copyBit(x: number, y: number, bits: number) {
    return this.#matrix.get(x, y) ? (bits << 1) | 0x01 : bits << 1;
  }

  public readVersion(): Version {
    const { size } = this.#matrix;

    let version = Math.floor((size - 17) / 4);

    if (version >= 1 && version <= 6) {
      return VERSIONS[version - 1];
    }

    // Hmm, failed. Try bottom left: 6 wide by 3 tall
    let version1 = 0;
    let version2 = 0;

    const min = size - 11;

    for (let y = 5; y >= 0; y--) {
      for (let x = size - 9; x >= min; x--) {
        version1 = this.#copyBit(x, y, version1);
      }
    }

    for (let x = 5; x >= 0; x--) {
      for (let y = size - 9; y >= min; y--) {
        version2 = this.#copyBit(x, y, version2);
      }
    }

    return decodeVersion(version1, version2);
  }

  public readFormatInfo(): FormatInfo {
    let formatInfo1 = 0;
    let formatInfo2 = 0;

    const { size } = this.#matrix;
    const max = size - 7;

    // Read top-left format info bits
    for (let x = 0; x <= 8; x++) {
      if (x !== 6) {
        // Skip timing pattern bit
        formatInfo1 = this.#copyBit(x, 8, formatInfo1);
      }
    }

    for (let y = 7; y >= 0; y--) {
      if (y !== 6) {
        // Skip timing pattern bit
        formatInfo1 = this.#copyBit(8, y, formatInfo1);
      }
    }

    for (let y = size - 1; y >= max; y--) {
      formatInfo2 = this.#copyBit(8, y, formatInfo2);
    }

    for (let x = size - 8; x < size; x++) {
      formatInfo2 = this.#copyBit(x, 8, formatInfo2);
    }

    return decodeFormatInfo(formatInfo1, formatInfo2);
  }

  public readCodewords(version: Version): Uint8Array {
    let bitsRead = 0;
    let currentByte = 0;
    let readingUp = true;
    let resultOffset = 0;

    const matrix = this.#matrix;
    const functionPattern = buildFunctionPattern(version);
    const codewords = new Uint8Array(version.totalCodewords);

    const { size } = matrix;

    // Read columns in pairs, from right to left
    for (let x = size - 1; x > 0; x -= 2) {
      if (x === 6) {
        // Skip whole column with vertical alignment pattern
        // saves time and makes the other code proceed more cleanly
        x--;
      }

      // Read alternatingly from bottom to top then top to bottom
      for (let count = 0; count < size; count++) {
        const y = readingUp ? size - 1 - count : count;

        for (let col = 0; col < 2; col++) {
          const offsetX = x - col;

          // Ignore bits covered by the function pattern
          if (!functionPattern.get(offsetX, y)) {
            // Read a bit
            bitsRead++;
            currentByte <<= 1;

            if (matrix.get(offsetX, y)) {
              currentByte |= 1;
            }

            // If we've made a whole byte, save it off
            if (bitsRead === 8) {
              codewords[resultOffset++] = currentByte;

              bitsRead = 0;
              currentByte = 0;
            }
          }
        }
      }

      // Switch directions
      readingUp = !readingUp;
    }

    return codewords;
  }

  public unmask(mask: number): void {
    const matrix = this.#matrix;
    const { size } = matrix;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (isApplyMask(mask, x, y)) {
          matrix.flip(x, y);
        }
      }
    }
  }

  public remask(mask: number): void {
    this.unmask(mask);
  }

  public mirror(): void {
    const matrix = this.#matrix;
    const { size } = matrix;

    for (let x = 0; x < size; x++) {
      for (let y = x + 1; y < size; y++) {
        if (matrix.get(x, y) !== matrix.get(y, x)) {
          matrix.flip(x, y);
          matrix.flip(y, x);
        }
      }
    }
  }
}
