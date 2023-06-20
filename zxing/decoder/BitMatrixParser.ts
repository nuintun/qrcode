/**
 * @module BitMatrixParser
 */

import { BitMatrix } from '/common/BitMatrix';
import { decodeFormatInfo, FormatInfo } from './FormatInfo';
import { decodeVersion, Version, VERSIONS } from '/common/Version';

export class BitMatrixParser {
  #mirror: boolean;
  #version: Version;
  #matrix: BitMatrix;
  #codewords: Uint8Array;
  #formatInfo: FormatInfo;

  constructor(matrix: BitMatrix, mirror: boolean = false) {
    const dimension = Math.min(matrix.width, matrix.height);

    if (dimension < 21 || (dimension & 0x03) !== 1) {
      throw new Error('illegal qrcode dimension');
    }

    const version = this.#readVersion(dimension);
    const formatInfo = this.#readFormatInfo(dimension);

    this.#matrix = matrix;
    this.#mirror = mirror;
    this.#version = version;
    this.#formatInfo = formatInfo;
    this.#codewords = this.#readCodewords(version, formatInfo);
  }

  #copyBit(x: number, y: number, bits: number) {
    const matrix = this.#matrix;
    const bit = this.#mirror ? matrix.get(y, x) : matrix.get(x, y);

    return bit ? (bits << 1) | 0x1 : bits << 1;
  }

  #readVersion(dimension: number): Version {
    let version = Math.floor((dimension - 17) / 4);

    if (version >= 1 && version <= 6) {
      return VERSIONS[version - 1];
    }

    // Hmm, failed. Try bottom left: 6 wide by 3 tall
    let version1 = 0;
    let version2 = 0;

    const min = dimension - 11;

    for (let y = 5; y >= 0; y--) {
      for (let x = dimension - 9; x >= min; x--) {
        version1 = this.#copyBit(x, y, version1);
      }
    }

    for (let x = 5; x >= 0; x--) {
      for (let y = dimension - 9; y >= min; y--) {
        version2 = this.#copyBit(x, y, version2);
      }
    }

    return decodeVersion(version1, version2);
  }

  #readFormatInfo(dimension: number): FormatInfo {
    let formatInfo1 = 0;
    let formatInfo2 = 0;

    const max = dimension - 7;

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

    for (let y = dimension - 1; y >= max; y--) {
      formatInfo2 = this.#copyBit(8, y, formatInfo2);
    }

    for (let x = dimension - 8; x < dimension; x++) {
      formatInfo2 = this.#copyBit(x, 8, formatInfo2);
    }

    return decodeFormatInfo(formatInfo1, formatInfo2);
  }

  #readCodewords(version: Version, _formatInfo: FormatInfo): Uint8Array {
    const codewords = new Uint8Array(version.totalCodewords);

    return codewords;
  }

  public get version(): Version {
    return this.#version;
  }

  public get codewords(): Uint8Array {
    return this.#codewords;
  }

  public get formatInfo(): FormatInfo {
    return this.#formatInfo;
  }
}
