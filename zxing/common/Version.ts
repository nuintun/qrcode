/**
 * @module Version
 */

import { ECB } from './ECB';
import { ECLevel } from './ECLevel';
import { ECBlocks } from './ECBlocks';
import { BitMatrix } from './BitMatrix';
import { bitCount, toInt32 } from './utils';

const VERSION_DECODE_TABLE = [
  // Version 7 - 11
  0x07c94, 0x085bc, 0x09a99, 0x0a4d3, 0x0bbf6,
  // Version 12 - 16
  0x0c762, 0x0d847, 0x0e60d, 0x0f928, 0x10b78,
  // Version 17 - 21
  0x1145d, 0x12a17, 0x13532, 0x149a6, 0x15683,
  // Version 22 - 26
  0x168c9, 0x177ec, 0x18ec4, 0x191e1, 0x1afab,
  // Version 27 - 31
  0x1b08e, 0x1cc1a, 0x1d33f, 0x1ed75, 0x1f250,
  // Version 32 - 36
  0x209d5, 0x216f0, 0x228ba, 0x2379f, 0x24b0b,
  // Version 37 - 40
  0x2542e, 0x26a64, 0x27541, 0x28c69
];

export class Version {
  #size: number;
  #version: number;
  #ecBlocks: ECBlocks[];
  #alignmentPatterns: number[];

  constructor(version: number, alignmentPatterns: number[], ...ecBlocks: ECBlocks[]) {
    this.#version = version;
    this.#ecBlocks = ecBlocks;
    this.#size = 17 + 4 * version;
    this.#alignmentPatterns = alignmentPatterns;
  }

  public get size(): number {
    return this.#size;
  }

  public get version(): number {
    return this.#version;
  }

  public get alignmentPatterns(): number[] {
    return this.#alignmentPatterns;
  }

  public getECBlocks({ level }: ECLevel): ECBlocks {
    return this.#ecBlocks[level];
  }
}

export const VERSIONS = [
  new Version(
    1,
    [],
    new ECBlocks(7, new ECB(1, 19)),
    new ECBlocks(10, new ECB(1, 16)),
    new ECBlocks(13, new ECB(1, 13)),
    new ECBlocks(17, new ECB(1, 9))
  ),
  new Version(
    2,
    [6, 18],
    new ECBlocks(10, new ECB(1, 34)),
    new ECBlocks(16, new ECB(1, 28)),
    new ECBlocks(22, new ECB(1, 22)),
    new ECBlocks(28, new ECB(1, 16))
  ),
  new Version(
    3,
    [6, 22],
    new ECBlocks(15, new ECB(1, 55)),
    new ECBlocks(26, new ECB(1, 44)),
    new ECBlocks(18, new ECB(2, 17)),
    new ECBlocks(22, new ECB(2, 13))
  ),
  new Version(
    4,
    [6, 26],
    new ECBlocks(20, new ECB(1, 80)),
    new ECBlocks(18, new ECB(2, 32)),
    new ECBlocks(26, new ECB(2, 24)),
    new ECBlocks(16, new ECB(4, 9))
  ),
  new Version(
    5,
    [6, 30],
    new ECBlocks(26, new ECB(1, 108)),
    new ECBlocks(24, new ECB(2, 43)),
    new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)),
    new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))
  ),
  new Version(
    6,
    [6, 34],
    new ECBlocks(18, new ECB(2, 68)),
    new ECBlocks(16, new ECB(4, 27)),
    new ECBlocks(24, new ECB(4, 19)),
    new ECBlocks(28, new ECB(4, 15))
  ),
  new Version(
    7,
    [6, 22, 38],
    new ECBlocks(20, new ECB(2, 78)),
    new ECBlocks(18, new ECB(4, 31)),
    new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)),
    new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))
  ),
  new Version(
    8,
    [6, 24, 42],
    new ECBlocks(24, new ECB(2, 97)),
    new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)),
    new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)),
    new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))
  ),
  new Version(
    9,
    [6, 26, 46],
    new ECBlocks(30, new ECB(2, 116)),
    new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)),
    new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)),
    new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))
  ),
  new Version(
    10,
    [6, 28, 50],
    new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)),
    new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)),
    new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)),
    new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))
  ),
  new Version(
    11,
    [6, 30, 54],
    new ECBlocks(20, new ECB(4, 81)),
    new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)),
    new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)),
    new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))
  ),
  new Version(
    12,
    [6, 32, 58],
    new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)),
    new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)),
    new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)),
    new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))
  ),
  new Version(
    13,
    [6, 34, 62],
    new ECBlocks(26, new ECB(4, 107)),
    new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)),
    new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)),
    new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))
  ),
  new Version(
    14,
    [6, 26, 46, 66],
    new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)),
    new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)),
    new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)),
    new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))
  ),
  new Version(
    15,
    [6, 26, 48, 70],
    new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)),
    new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)),
    new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)),
    new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))
  ),
  new Version(
    16,
    [6, 26, 50, 74],
    new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)),
    new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)),
    new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)),
    new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))
  ),
  new Version(
    17,
    [6, 30, 54, 78],
    new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)),
    new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)),
    new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)),
    new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))
  ),
  new Version(
    18,
    [6, 30, 56, 82],
    new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)),
    new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)),
    new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)),
    new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))
  ),
  new Version(
    19,
    [6, 30, 58, 86],
    new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)),
    new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)),
    new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)),
    new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))
  ),
  new Version(
    20,
    [6, 34, 62, 90],
    new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)),
    new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)),
    new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)),
    new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))
  ),
  new Version(
    21,
    [6, 28, 50, 72, 94],
    new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)),
    new ECBlocks(26, new ECB(17, 42)),
    new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)),
    new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))
  ),
  new Version(
    22,
    [6, 26, 50, 74, 98],
    new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)),
    new ECBlocks(28, new ECB(17, 46)),
    new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)),
    new ECBlocks(24, new ECB(34, 13))
  ),
  new Version(
    23,
    [6, 30, 54, 78, 102],
    new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)),
    new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)),
    new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)),
    new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))
  ),
  new Version(
    24,
    [6, 28, 54, 80, 106],
    new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)),
    new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)),
    new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)),
    new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))
  ),
  new Version(
    25,
    [6, 32, 58, 84, 110],
    new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)),
    new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)),
    new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)),
    new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))
  ),
  new Version(
    26,
    [6, 30, 58, 86, 114],
    new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)),
    new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)),
    new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)),
    new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))
  ),
  new Version(
    27,
    [6, 34, 62, 90, 118],
    new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)),
    new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)),
    new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)),
    new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))
  ),
  new Version(
    28,
    [6, 26, 50, 74, 98, 122],
    new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)),
    new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)),
    new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)),
    new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))
  ),
  new Version(
    29,
    [6, 30, 54, 78, 102, 126],
    new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)),
    new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)),
    new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)),
    new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))
  ),
  new Version(
    30,
    [6, 26, 52, 78, 104, 130],
    new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)),
    new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)),
    new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)),
    new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))
  ),
  new Version(
    31,
    [6, 30, 56, 82, 108, 134],
    new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)),
    new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)),
    new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)),
    new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))
  ),
  new Version(
    32,
    [6, 34, 60, 86, 112, 138],
    new ECBlocks(30, new ECB(17, 115)),
    new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)),
    new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)),
    new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))
  ),
  new Version(
    33,
    [6, 30, 58, 86, 114, 142],
    new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)),
    new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)),
    new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)),
    new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))
  ),
  new Version(
    34,
    [6, 34, 62, 90, 118, 146],
    new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)),
    new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)),
    new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)),
    new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))
  ),
  new Version(
    35,
    [6, 30, 54, 78, 102, 126, 150],
    new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)),
    new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)),
    new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)),
    new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))
  ),
  new Version(
    36,
    [6, 24, 50, 76, 102, 128, 154],
    new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)),
    new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)),
    new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)),
    new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))
  ),
  new Version(
    37,
    [6, 28, 54, 80, 106, 132, 158],
    new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)),
    new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)),
    new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)),
    new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))
  ),
  new Version(
    38,
    [6, 32, 58, 84, 110, 136, 162],
    new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)),
    new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)),
    new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)),
    new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))
  ),
  new Version(
    39,
    [6, 26, 54, 82, 110, 138, 166],
    new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)),
    new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)),
    new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)),
    new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))
  ),
  new Version(
    40,
    [6, 30, 58, 86, 114, 142, 170],
    new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)),
    new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)),
    new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)),
    new ECBlocks(30, new ECB(20, 15), new ECB(61, 16))
  )
];

export const MIN_VERSION_SIZE = VERSIONS[0].size;

export const MAX_VERSION_SIZE = VERSIONS[39].size;

export function fromVersionSize(size: number): Version {
  if ((size & 0x03) !== 1) {
    throw new Error('');
  }

  const version = VERSIONS[toInt32((size - 17) / 4) - 1];

  if (version != null) {
    return version;
  }

  throw new Error('');
}

export function decodeVersion(version1: number, version2: number): Version {
  let bestDiff = 32;
  let bestVersion = 0;

  const { length } = VERSION_DECODE_TABLE;

  for (let i = 0; i < length; i++) {
    const maskedVersion = VERSION_DECODE_TABLE[i];

    // Do the version info bits match exactly done ?
    if (version1 === maskedVersion || version2 === maskedVersion) {
      return VERSIONS[i + 6];
    }

    // Otherwise see if this is the closest to a real version info bit string we have seen so far
    let bitsDiff = bitCount(version1 ^ maskedVersion);

    if (bitsDiff < bestDiff) {
      bestDiff = bitsDiff;
      bestVersion = i + 7;
    }

    if (version1 !== version2) {
      // Also try the other option
      bitsDiff = bitCount(version2 ^ maskedVersion);

      if (bitsDiff < bestDiff) {
        bestDiff = bitsDiff;
        bestVersion = i + 7;
      }
    }
  }

  // We can tolerate up to 3 bits of error since no two version info codewords will differ in less than 8 bits
  if (bestDiff <= 3 && bestVersion >= 7) {
    return VERSIONS[bestVersion - 1];
  }

  // If we didn't find a close enough match, fail
  throw new Error('unable to decode version');
}

// See ISO 18004:2006 Annex E
export function buildFunctionPattern({ size, version, alignmentPatterns }: Version): BitMatrix {
  const matrix = new BitMatrix(size, size);

  // Top left finder pattern + separator + format
  matrix.setRegion(0, 0, 9, 9);
  // Top right finder pattern + separator + format
  matrix.setRegion(size - 8, 0, 8, 9);
  // Bottom left finder pattern + separator + format
  matrix.setRegion(0, size - 8, 9, 8);

  // Alignment patterns
  const max = alignmentPatterns.length;

  for (let x = 0; x < max; x++) {
    const top = alignmentPatterns[x] - 2;

    for (let y = 0; y < max; y++) {
      if ((x !== 0 || (y !== 0 && y !== max - 1)) && (x !== max - 1 || y !== 0)) {
        matrix.setRegion(alignmentPatterns[y] - 2, top, 5, 5);
      }
      // Else no o alignment patterns near the three finder patterns
    }
  }

  // Vertical timing pattern
  matrix.setRegion(6, 9, 1, size - 17);
  // Horizontal timing pattern
  matrix.setRegion(9, 6, size - 17, 1);

  if (version > 6) {
    // Version info, top right
    matrix.setRegion(size - 11, 0, 3, 6);
    // Version info, bottom left
    matrix.setRegion(0, size - 11, 6, 3);
  }

  return matrix;
}
