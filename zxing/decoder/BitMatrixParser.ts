/**
 * @module BitMatrixParser
 */

import { ECLevel } from '/common/ECLevel';
import { isApplyMask } from '/common/mask';
import { BitMatrix } from '/common/BitMatrix';
import { decodeFormatInfo, FormatInfo } from './FormatInfo';
import { buildFunctionPattern, decodeVersion, Version, VERSIONS } from '/common/Version';

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

  public readCodewords(version: Version, ecLevel: ECLevel): Uint8Array {
    let bitsRead = 0;
    let currentByte = 0;
    let readingUp = true;
    let resultOffset = 0;

    const matrix = this.#matrix;
    const ecBlocks = version.getECBlocks(ecLevel);
    const functionPattern = buildFunctionPattern(version);
    const codewords = new Uint8Array(ecBlocks.numTotalCodewords);

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
