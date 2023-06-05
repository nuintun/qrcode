/**
 * @module matrix
 */

import { ECLevel } from '/common/ECLevel';
import { Version } from '/common/Version';
import { BitArray } from '/common/BitArray';
import { ByteMatrix } from '/encoder/ByteMatrix';
import { getDataMaskBit } from './mask';

const TYPE_INFO_POLY = 0x537;

// 1 1111 0010 0101
const VERSION_INFO_POLY = 0x1f25;

const TYPE_INFO_MASK_PATTERN = 0x5412;

const TYPE_INFO_COORDINATES = [
  [8, 0],
  [8, 1],
  [8, 2],
  [8, 3],
  [8, 4],
  [8, 5],
  [8, 7],
  [8, 8],
  [7, 8],
  [5, 8],
  [4, 8],
  [3, 8],
  [2, 8],
  [1, 8],
  [0, 8]
];

const POSITION_DETECTION_PATTERN = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

const POSITION_ADJUSTMENT_PATTERN = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]
];

const POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE = [
  [], // Version 1
  [6, 18], // Version 2
  [6, 22], // Version 3
  [6, 26], // Version 4
  [6, 30], // Version 5
  [6, 34], // Version 6
  [6, 22, 38], // Version 7
  [6, 24, 42], // Version 8
  [6, 26, 46], // Version 9
  [6, 28, 50], // Version 10
  [6, 30, 54], // Version 11
  [6, 32, 58], // Version 12
  [6, 34, 62], // Version 13
  [6, 26, 46, 66], // Version 14
  [6, 26, 48, 70], // Version 15
  [6, 26, 50, 74], // Version 16
  [6, 30, 54, 78], // Version 17
  [6, 30, 56, 82], // Version 18
  [6, 30, 58, 86], // Version 19
  [6, 34, 62, 90], // Version 20
  [6, 28, 50, 72, 94], // Version 21
  [6, 26, 50, 74, 98], // Version 22
  [6, 30, 54, 78, 102], // Version 23
  [6, 28, 54, 80, 106], // Version 24
  [6, 32, 58, 84, 110], // Version 25
  [6, 30, 58, 86, 114], // Version 26
  [6, 34, 62, 90, 118], // Version 27
  [6, 26, 50, 74, 98, 122], // Version 28
  [6, 30, 54, 78, 102, 126], // Version 29
  [6, 26, 52, 78, 104, 130], // Version 30
  [6, 30, 56, 82, 108, 134], // Version 31
  [6, 34, 60, 86, 112, 138], // Version 32
  [6, 30, 58, 86, 114, 142], // Version 33
  [6, 34, 62, 90, 118, 146], // Version 34
  [6, 30, 54, 78, 102, 126, 150], // Version 35
  [6, 24, 50, 76, 102, 128, 154], // Version 36
  [6, 28, 54, 80, 106, 132, 158], // Version 37
  [6, 32, 58, 84, 110, 136, 162], // Version 38
  [6, 26, 54, 82, 110, 138, 166], // Version 39
  [6, 30, 58, 86, 114, 142, 170] // Version 40
];

function isEmpty(matrix: ByteMatrix, x: number, y: number): boolean {
  return matrix.get(x, y) === -1;
}

function embedPositionDetectionPattern(matrix: ByteMatrix, x: number, y: number): void {
  for (let i = 0; i < 7; i++) {
    const pattern = POSITION_DETECTION_PATTERN[i];

    for (let j = 0; j < 7; j++) {
      matrix.set(x + j, y + i, pattern[j]);
    }
  }
}

function embedHorizontalSeparationPattern(matrix: ByteMatrix, x: number, y: number): void {
  for (let j = 0; j < 8; j++) {
    matrix.set(x + j, y, 0);
  }
}

function embedVerticalSeparationPattern(matrix: ByteMatrix, x: number, y: number): void {
  for (let i = 0; i < 7; i++) {
    matrix.set(x, y + i, 0);
  }
}

function embedPositionAdjustmentPattern(matrix: ByteMatrix, x: number, y: number): void {
  for (let i = 0; i < 5; i++) {
    const pattern = POSITION_ADJUSTMENT_PATTERN[i];

    for (let j = 0; j < 5; j++) {
      matrix.set(x + j, y + i, pattern[j]);
    }
  }
}

function embedDarkDotAtLeftBottomCorner(matrix: ByteMatrix): void {
  matrix.set(8, matrix.height - 8, 1);
}

function embedPositionDetectionPatternsAndSeparators(matrix: ByteMatrix): void {
  // Matrix width
  const { width, height } = matrix;
  // Embed three big squares at corners.
  const pdpWidth = POSITION_DETECTION_PATTERN[0].length;

  // Left top corner.
  embedPositionDetectionPattern(matrix, 0, 0);
  // Right top corner.
  embedPositionDetectionPattern(matrix, width - pdpWidth, 0);
  // Left bottom corner.
  embedPositionDetectionPattern(matrix, 0, width - pdpWidth);

  // Embed horizontal separation patterns around the squares.
  const hspWidth = 8;

  // Left top corner.
  embedHorizontalSeparationPattern(matrix, 0, hspWidth - 1);
  // Right top corner.
  embedHorizontalSeparationPattern(matrix, width - hspWidth, hspWidth - 1);
  // Left bottom corner.
  embedHorizontalSeparationPattern(matrix, 0, width - hspWidth);

  // Embed vertical separation patterns around the squares.
  const vspHeight = 7;

  // Left top corner.
  embedVerticalSeparationPattern(matrix, vspHeight, 0);
  // Right top corner.
  embedVerticalSeparationPattern(matrix, height - vspHeight - 1, 0);
  // Left bottom corner.
  embedVerticalSeparationPattern(matrix, vspHeight, height - vspHeight);
}

function embedTimingPatterns(matrix: ByteMatrix): void {
  const width = matrix.width - 8;
  const height = matrix.height - 8;

  // -8 is for skipping position detection patterns (7: size)
  // separation patterns (1: size). Thus, 8 = 7 + 1.
  for (let i = 8; i < height; i++) {
    const bit = (i + 1) % 2;

    // Vertical line.
    if (isEmpty(matrix, 6, i)) {
      matrix.set(6, i, bit);
    }
  }

  // -8 is for skipping position detection patterns (7: size)
  // separation patterns (1: size). Thus, 8 = 7 + 1.
  for (let j = 8; j < width; j++) {
    const bit = (j + 1) % 2;

    // Horizontal line.
    if (isEmpty(matrix, j, 6)) {
      matrix.set(j, 6, bit);
    }
  }
}

function embedPositionAdjustmentPatterns(matrix: ByteMatrix, { version }: Version): void {
  if (version >= 2) {
    const coordinates = POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[version - 1];
    const { length } = coordinates;

    for (let i = 0; i !== length; i++) {
      const y = coordinates[i];

      for (let j = 0; j !== length; j++) {
        const x = coordinates[j];

        if (isEmpty(matrix, x, y)) {
          // If the cell is unset, we embed the position adjustment pattern here.
          // -2 is necessary since the x/y coordinates point to the center of the pattern, not the
          // left top corner.
          embedPositionAdjustmentPattern(matrix, x - 2, y - 2);
        }
      }
    }
  }
}

function embedBasicPatterns(matrix: ByteMatrix, version: Version): void {
  // Let's get started with embedding big squares at corners.
  embedPositionDetectionPatternsAndSeparators(matrix);
  // Then, embed the dark dot at the left bottom corner.
  embedDarkDotAtLeftBottomCorner(matrix);
  // Position adjustment patterns appear if version >= 2.
  embedPositionAdjustmentPatterns(matrix, version);
  // Timing patterns should be embedded after position adj. patterns.
  embedTimingPatterns(matrix);
}

function findMSBSet(value: number): number {
  return 32 - Math.clz32(value);
}

function calculateBCHCode(value: number, poly: number): number {
  if (poly === 0) {
    throw new Error('0 polynomial');
  }

  // If poly is "1 1111 0010 0101" (version info poly), msbSetInPoly is 13. We'll subtract 1
  // from 13 to make it 12.
  const msbSetInPoly = findMSBSet(poly);

  value <<= msbSetInPoly - 1;

  // Do the division business using exclusive-or operations.
  while (findMSBSet(value) >= msbSetInPoly) {
    value ^= poly << (findMSBSet(value) - msbSetInPoly);
  }

  // Now the "value" is the remainder (i.e. the BCH code)
  return value;
}

function makeTypeInfoBits(bits: BitArray, ecLevel: ECLevel, mask: number): void {
  const typeInfo = (ecLevel.bits << 3) | mask;

  bits.append(typeInfo, 5);

  const bchCode = calculateBCHCode(typeInfo, TYPE_INFO_POLY);

  bits.append(bchCode, 10);

  const maskBits = new BitArray();

  maskBits.append(TYPE_INFO_MASK_PATTERN, 15);

  bits.xor(maskBits);
}

function embedTypeInfo(matrix: ByteMatrix, ecLevel: ECLevel, mask: number): void {
  const typeInfoBits = new BitArray();

  makeTypeInfoBits(typeInfoBits, ecLevel, mask);

  const { length } = typeInfoBits;
  const { width, height } = matrix;

  for (let i = 0; i < length; i++) {
    // Place bits in LSB to MSB order.  LSB (least significant bit) is the last value in
    // "typeInfoBits".
    const bit = typeInfoBits.get(length - 1 - i);
    // Type info bits at the left top corner. See 8.9 of JISX0510:2004 (p.46).
    const [x1, y1] = TYPE_INFO_COORDINATES[i];

    matrix.set(x1, y1, bit);

    let x2;
    let y2;

    if (i < 8) {
      // Right top corner.
      x2 = width - i - 1;
      y2 = 8;
    } else {
      // Left bottom corner.
      x2 = 8;
      y2 = height - 7 + (i - 8);
    }

    matrix.set(x2, y2, bit);
  }
}

function makeVersionInfoBits(bits: BitArray, version: number): void {
  bits.append(version, 6);

  const bchCode = calculateBCHCode(version, VERSION_INFO_POLY);

  bits.append(bchCode, 12);
}

function embedVersionInfo(matrix: ByteMatrix, { version }: Version): void {
  if (version >= 7) {
    const versionInfoBits = new BitArray();

    makeVersionInfoBits(versionInfoBits, version);

    // It will decrease from 17 to 0.
    let bitIndex = 6 * 3 - 1;

    const { height } = matrix;

    for (let i = 0; i < 6; ++i) {
      for (let j = 0; j < 3; ++j) {
        // Place bits in LSB (least significant bit) to MSB order.
        const bit = versionInfoBits.get(bitIndex);

        bitIndex--;

        // Left bottom corner.
        matrix.set(i, height - 11 + j, bit);
        // Right bottom corner.
        matrix.set(height - 11 + j, i, bit);
      }
    }
  }
}

function embedDataBits(matrix: ByteMatrix, dataBits: BitArray, mask: number): void {
  const { length } = dataBits;
  const { width, height } = matrix;

  let bitIndex = 0;
  let direction = -1;
  // Start from the right bottom cell.
  let x = width - 1;
  let y = height - 1;

  while (x > 0) {
    // Skip the vertical timing pattern.
    if (x === 6) {
      x -= 1;
    }

    while (y >= 0 && y < height) {
      for (let i = 0; i < 2; i++) {
        const offsetX = x - i;

        // Skip the cell if it's not empty.
        if (!isEmpty(matrix, offsetX, y)) {
          continue;
        }

        let bit: number;

        if (bitIndex < length) {
          bit = dataBits.get(bitIndex++);
        } else {
          // Padding bit. If there is no bit left, we'll fill the left cells with 0, as described
          // in 8.4.9 of JISX0510:2004 (p. 24).
          bit = 0;
        }

        // Apply mask.
        bit ^= getDataMaskBit(mask, x, y);

        matrix.set(offsetX, y, bit);
      }

      y += direction;
    }

    // Reverse the direction.
    direction = -direction;
    // Update y.
    y += direction;
    // Move to the left.
    x -= 2;
  }
}

export function buildMatrix(matrix: ByteMatrix, dataBits: BitArray, version: Version, ecLevel: ECLevel, mask: number): void {
  // Clear matrix
  matrix.clear(-1);

  // Embed basic patterns
  embedBasicPatterns(matrix, version);
  // Type information appear with any version.
  embedTypeInfo(matrix, ecLevel, mask);
  // Version info appear if version >= 7.
  embedVersionInfo(matrix, version);
  // Data should be embedded at end.
  embedDataBits(matrix, dataBits, mask);
}
