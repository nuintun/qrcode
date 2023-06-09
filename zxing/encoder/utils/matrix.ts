/**
 * @module matrix
 */

import { isApplyMask } from './mask';
import { ECLevel } from '/common/ECLevel';
import { Version } from '/common/Version';
import { BitArray } from '/common/BitArray';
import { ByteMatrix } from '/encoder/ByteMatrix';

// Format information poly: 101 0011 0111
const FORMAT_INFO_POLY = 0x537;

// Format information mask
const FORMAT_INFO_MASK = 0x5412;

// Version information poly: 1 1111 0010 0101
const VERSION_INFO_POLY = 0x1f25;

// Format information coordinates
const FORMAT_INFO_COORDINATES = [
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

// Position detection pattern
const POSITION_DETECTION_PATTERN = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

// Position adjustment pattern
const POSITION_ADJUSTMENT_PATTERN = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]
];

// From Appendix E. Table 1, JIS0510X:2004 (p 71).
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

// Is empty point.
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

// Embed the lonely dark dot at left bottom corner. JISX0510:2004 (p.46)
function embedDarkDotAtLeftBottomCorner(matrix: ByteMatrix): void {
  matrix.set(8, matrix.height - 8, 1);
}

// Embed position detection patterns and surrounding vertical/horizontal separators.
function embedPositionDetectionPatternsAndSeparators(matrix: ByteMatrix): void {
  // Embed three big squares at corners.
  const pdpWidth = 7;
  // Embed horizontal separation patterns around the squares.
  const hspWidth = 8;
  // Embed vertical separation patterns around the squares.
  const vspHeight = 7;
  // Matrix width
  const { width, height } = matrix;

  // Left top corner.
  embedPositionDetectionPattern(matrix, 0, 0);
  // Right top corner.
  embedPositionDetectionPattern(matrix, width - pdpWidth, 0);
  // Left bottom corner.
  embedPositionDetectionPattern(matrix, 0, width - pdpWidth);

  // Left top corner.
  embedHorizontalSeparationPattern(matrix, 0, hspWidth - 1);
  // Right top corner.
  embedHorizontalSeparationPattern(matrix, width - hspWidth, hspWidth - 1);
  // Left bottom corner.
  embedHorizontalSeparationPattern(matrix, 0, width - hspWidth);

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
  for (let x = 8; x < width; x++) {
    const bit = (x + 1) & 1;

    // Horizontal line.
    if (isEmpty(matrix, x, 6)) {
      matrix.set(x, 6, bit);
    }
  }

  // -8 is for skipping position detection patterns (7: size)
  // separation patterns (1: size). Thus, 8 = 7 + 1.
  for (let y = 8; y < height; y++) {
    const bit = (y + 1) & 1;

    // Vertical line.
    if (isEmpty(matrix, 6, y)) {
      matrix.set(6, y, bit);
    }
  }
}

// Embed position adjustment patterns if need be.
function embedPositionAdjustmentPatterns(matrix: ByteMatrix, { version }: Version): void {
  if (version >= 2) {
    const coordinates = POSITION_ADJUSTMENT_PATTERN_COORDINATE_TABLE[version - 1];
    const { length } = coordinates;

    for (let i = 0; i < length; i++) {
      const y = coordinates[i];

      for (let j = 0; j < length; j++) {
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

// Embed basic patterns. On success, modify the matrix.
// The basic patterns are:
// - Position detection patterns
// - Timing patterns
// - Dark dot at the left bottom corner
// - Position adjustment patterns, if need be
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

// Return the position of the most significant bit set (to one) in the "value". The most
// significant bit is position 32. If there is no bit set, return 0. Examples:
// - findMSBSet(0) => 0
// - findMSBSet(1) => 1
// - findMSBSet(255) => 8
function findMSBSet(value: number): number {
  return 32 - Math.clz32(value);
}

// Calculate BCH (Bose-Chaudhuri-Hocquenghem) code for "value" using polynomial "poly". The BCH
// code is used for encoding type information and version information.
// Example: Calculation of version information of 7.
// f(x) is created from 7.
//   - 7 = 000111 in 6 bits
//   - f(x) = x^2 + x^1 + x^0
// g(x) is given by the standard (p. 67)
//   - g(x) = x^12 + x^11 + x^10 + x^9 + x^8 + x^5 + x^2 + 1
// Multiply f(x) by x^(18 - 6)
//   - f'(x) = f(x) * x^(18 - 6)
//   - f'(x) = x^14 + x^13 + x^12
// Calculate the remainder of f'(x) / g(x)
//         x^2
//         __________________________________________________
//   g(x) )x^14 + x^13 + x^12
//         x^14 + x^13 + x^12 + x^11 + x^10 + x^7 + x^4 + x^2
//         --------------------------------------------------
//                              x^11 + x^10 + x^7 + x^4 + x^2
//
// The remainder is x^11 + x^10 + x^7 + x^4 + x^2
// Encode it in binary: 110010010100
// The return value is 0xc94 (1100 1001 0100)
//
// Since all coefficients in the polynomials are 1 or 0, we can do the calculation by bit
// operations. We don't care if coefficients are positive or negative.
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

// Make bit vector of format information. On success, store the result in "bits".
// Encode error correction level and mask pattern. See 8.9 of
// JISX0510:2004 (p.45) for details.
function makeFormatInfoBits(bits: BitArray, ecLevel: ECLevel, mask: number): void {
  const formatInfo = (ecLevel.bits << 3) | mask;

  bits.append(formatInfo, 5);

  const bchCode = calculateBCHCode(formatInfo, FORMAT_INFO_POLY);

  bits.append(bchCode, 10);

  const maskBits = new BitArray();

  maskBits.append(FORMAT_INFO_MASK, 15);

  bits.xor(maskBits);
}

// Embed format information. On success, modify the matrix.
function embedFormatInfo(matrix: ByteMatrix, ecLevel: ECLevel, mask: number): void {
  const formatInfoBits = new BitArray();

  makeFormatInfoBits(formatInfoBits, ecLevel, mask);

  const { width, height } = matrix;
  const { length } = formatInfoBits;

  for (let i = 0; i < length; i++) {
    // Type info bits at the left top corner. See 8.9 of JISX0510:2004 (p.46).
    const [x, y] = FORMAT_INFO_COORDINATES[i];
    // Place bits in LSB to MSB order. LSB (least significant bit) is the last value in formatInfoBits.
    const bit = formatInfoBits.get(length - 1 - i);

    matrix.set(x, y, bit);

    if (i < 8) {
      // Right top corner.
      matrix.set(width - i - 1, 8, bit);
    } else {
      // Left bottom corner.
      matrix.set(8, height - 7 + (i - 8), bit);
    }
  }
}

// Make bit vector of version information. On success, store the result in "bits".
// See 8.10 of JISX0510:2004 (p.45) for details.
function makeVersionInfoBits(bits: BitArray, version: number): void {
  bits.append(version, 6);

  const bchCode = calculateBCHCode(version, VERSION_INFO_POLY);

  bits.append(bchCode, 12);
}

// Embed version information if need be. On success, modify the matrix.
// See 8.10 of JISX0510:2004 (p.47) for how to embed version information.
function embedVersionInfo(matrix: ByteMatrix, { version }: Version): void {
  if (version >= 7) {
    const versionInfoBits = new BitArray();

    makeVersionInfoBits(versionInfoBits, version);

    // It will decrease from 17 to 0.
    let bitIndex = 6 * 3 - 1;

    const { height } = matrix;

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        // Place bits in LSB (least significant bit) to MSB order.
        const bit = versionInfoBits.get(bitIndex--);

        // Left bottom corner.
        matrix.set(i, height - 11 + j, bit);
        // Right bottom corner.
        matrix.set(height - 11 + j, i, bit);
      }
    }
  }
}

// Embed "dataBits" using "getMaskPattern". On success, modify the matrix.
// See 8.7 of JISX0510:2004 (p.38) for how to embed data bits.
function embedDataBits(matrix: ByteMatrix, dataBits: BitArray, mask: number): void {
  let bitIndex = 0;

  const { length } = dataBits;
  const { width, height } = matrix;

  // Start from the right bottom cell.
  for (let x = width - 1; x >= 1; x -= 2) {
    // Skip the vertical timing pattern.
    if (x === 6) {
      x = 5;
    }

    for (let y = 0; y < height; y++) {
      for (let i = 0; i < 2; i++) {
        const offsetX = x - i;
        const upward = ((x + 1) & 2) === 0;
        const offsetY = upward ? height - 1 - y : y;

        // Skip the cell if it's not empty.
        if (isEmpty(matrix, offsetX, offsetY)) {
          // Padding bit. If there is no bit left, we'll fill the left cells with 0,
          // as described in 8.4.9 of JISX0510:2004 (p. 24).
          let bit = 0;

          if (bitIndex < length) {
            bit = dataBits.get(bitIndex++);
          }

          // Is apply mask.
          if (isApplyMask(mask, offsetX, offsetY)) {
            bit ^= 1;
          }

          matrix.set(offsetX, offsetY, bit);
        }
      }
    }
  }

  // All bits should be consumed.
  if (bitIndex !== length) {
    throw new Error(`not all bits consumed: ${bitIndex}/${length}`);
  }
}

// Build 2D matrix of QR Code from "dataBits" with "ecLevel", "version" and "getMaskPattern". On
// success, store the result in "matrix".
export function buildMatrix(matrix: ByteMatrix, dataBits: BitArray, version: Version, ecLevel: ECLevel, mask: number): void {
  // Clear matrix
  matrix.clear(-1);

  // Embed basic patterns
  embedBasicPatterns(matrix, version);
  // Type information appear with any version.
  embedFormatInfo(matrix, ecLevel, mask);
  // Version info appear if version >= 7.
  embedVersionInfo(matrix, version);
  // Data should be embedded at end.
  embedDataBits(matrix, dataBits, mask);
}
