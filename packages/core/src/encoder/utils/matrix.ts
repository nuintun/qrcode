/**
 * @module matrix
 */

import { ECLevel } from '/common/ECLevel';
import { isApplyMask } from '/common/mask';
import { BitArray } from '/common/BitArray';
import { ByteMatrix } from '/common/ByteMatrix';
import { calculateBCHCode } from '/common/utils';
import { Version, VERSIONS } from '/common/Version';

// Format information poly: 101 0011 0111
const FORMAT_INFO_POLY = 0x537;

// Format information mask
const FORMAT_INFO_MASK = 0x5412;

// Version information poly: 1 1111 0010 0101
const VERSION_INFO_POLY = 0x1f25;

// Finder pattern shape
const FINDER_PATTERN_SHAPE = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1]
];

// Alignment pattern shape
const ALIGNMENT_PATTERN_SHAPE = [
  [1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1]
];

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

// Is empty point.
function isEmpty(matrix: ByteMatrix, x: number, y: number): boolean {
  return matrix.get(x, y) === -1;
}

function embedFinderPattern(matrix: ByteMatrix, x: number, y: number): void {
  for (let i = 0; i < 7; i++) {
    const pattern = FINDER_PATTERN_SHAPE[i];

    for (let j = 0; j < 7; j++) {
      matrix.set(x + j, y + i, pattern[j]);
    }
  }
}

function embedHorizontalSeparator(matrix: ByteMatrix, x: number, y: number): void {
  for (let j = 0; j < 8; j++) {
    matrix.set(x + j, y, 0);
  }
}

function embedVerticalSeparator(matrix: ByteMatrix, x: number, y: number): void {
  for (let i = 0; i < 7; i++) {
    matrix.set(x, y + i, 0);
  }
}

// Embed finder patterns and surrounding vertical/horizontal separators.
function embedFinderPatternsAndSeparators(matrix: ByteMatrix): void {
  // Embed three big squares at corners.
  const pdpWidth = 7;
  // Embed horizontal separation patterns around the squares.
  const hspWidth = 8;
  // Embed vertical separation patterns around the squares.
  const vspHeight = 7;
  // Matrix width
  const { size } = matrix;

  // Left top corner.
  embedFinderPattern(matrix, 0, 0);
  // Right top corner.
  embedFinderPattern(matrix, size - pdpWidth, 0);
  // Left bottom corner.
  embedFinderPattern(matrix, 0, size - pdpWidth);

  // Left top corner.
  embedHorizontalSeparator(matrix, 0, hspWidth - 1);
  // Right top corner.
  embedHorizontalSeparator(matrix, size - hspWidth, hspWidth - 1);
  // Left bottom corner.
  embedHorizontalSeparator(matrix, 0, size - hspWidth);

  // Left top corner.
  embedVerticalSeparator(matrix, vspHeight, 0);
  // Right top corner.
  embedVerticalSeparator(matrix, size - vspHeight - 1, 0);
  // Left bottom corner.
  embedVerticalSeparator(matrix, vspHeight, size - vspHeight);
}

function embedTimingPatterns(matrix: ByteMatrix): void {
  const size = matrix.size - 8;

  // -8 is for skipping position detection patterns (7: size)
  // separation patterns (1: size). Thus, 8 = 7 + 1.
  for (let x = 8; x < size; x++) {
    const bit = (x + 1) & 0x01;

    // Horizontal line.
    if (isEmpty(matrix, x, 6)) {
      matrix.set(x, 6, bit);
    }
  }

  // -8 is for skipping position detection patterns (7: size)
  // separation patterns (1: size). Thus, 8 = 7 + 1.
  for (let y = 8; y < size; y++) {
    const bit = (y + 1) & 0x01;

    // Vertical line.
    if (isEmpty(matrix, 6, y)) {
      matrix.set(6, y, bit);
    }
  }
}

function embedAlignmentPattern(matrix: ByteMatrix, x: number, y: number): void {
  for (let i = 0; i < 5; i++) {
    const pattern = ALIGNMENT_PATTERN_SHAPE[i];

    for (let j = 0; j < 5; j++) {
      matrix.set(x + j, y + i, pattern[j]);
    }
  }
}

// Embed position alignment patterns if need be.
function embedAlignmentPatterns(matrix: ByteMatrix, { version }: Version): void {
  if (version >= 2) {
    const { alignmentPatterns } = VERSIONS[version - 1];
    const { length } = alignmentPatterns;

    for (let i = 0; i < length; i++) {
      const y = alignmentPatterns[i];

      for (let j = 0; j < length; j++) {
        const x = alignmentPatterns[j];

        if (isEmpty(matrix, x, y)) {
          // If the cell is unset, we embed the position alignment pattern here.
          // -2 is necessary since the x/y coordinates point to the center of the pattern, not the
          // left top corner.
          embedAlignmentPattern(matrix, x - 2, y - 2);
        }
      }
    }
  }
}

// Embed the lonely dark dot at left bottom corner. ISO/IEC 18004:2015(E)(p.56)
function embedDarkModule(matrix: ByteMatrix): void {
  matrix.set(8, matrix.size - 8, 1);
}

// Make bit vector of format information. On success, store the result in "bits".
// Encode error correction level and mask pattern. See 8.9 of
// ISO/IEC 18004:2015(E)(p.55) for details.
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

  const { size } = matrix;
  const { length } = formatInfoBits;

  for (let i = 0; i < length; i++) {
    // Type info bits at the left top corner.
    const [x, y] = FORMAT_INFO_COORDINATES[i];
    // Place bits in LSB to MSB order. LSB (least significant bit) is the last value in formatInfoBits.
    const bit = formatInfoBits.get(length - 1 - i);

    matrix.set(x, y, bit);

    if (i < 8) {
      // Right top corner.
      matrix.set(size - i - 1, 8, bit);
    } else {
      // Left bottom corner.
      matrix.set(8, size - 7 + (i - 8), bit);
    }
  }

  // Then, embed the dark dot at the left bottom corner.
  embedDarkModule(matrix);
}

// Make bit vector of version information. On success, store the result in "bits".
// See 7.10 of ISO/IEC 18004:2015(E)(p.58) for details.
function makeVersionInfoBits(bits: BitArray, version: number): void {
  bits.append(version, 6);

  const bchCode = calculateBCHCode(version, VERSION_INFO_POLY);

  bits.append(bchCode, 12);
}

// Embed version information if need be. On success, modify the matrix.
// See 7.10 of ISO/IEC 18004:2015(E)(p.58) for how to embed version information.
function embedVersionInfo(matrix: ByteMatrix, { version }: Version): void {
  if (version >= 7) {
    const versionInfoBits = new BitArray();

    makeVersionInfoBits(versionInfoBits, version);

    // It will decrease from 17 to 0.
    let bitIndex = 6 * 3 - 1;

    const { size } = matrix;

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        // Place bits in LSB (least significant bit) to MSB order.
        const bit = versionInfoBits.get(bitIndex--);

        // Left bottom corner.
        matrix.set(i, size - 11 + j, bit);
        // Right bottom corner.
        matrix.set(size - 11 + j, i, bit);
      }
    }
  }
}

// Embed "codewords". On success, modify the matrix.
// See 7.7.3 of ISO/IEC 18004:2015(E)(p.46) for how to embed codewords.
function embedCodewords(matrix: ByteMatrix, codewords: BitArray, mask: number): void {
  let bitIndex = 0;

  const { size } = matrix;
  const { length } = codewords;

  // Start from the right bottom cell.
  for (let x = size - 1; x >= 1; x -= 2) {
    // Skip the vertical timing pattern.
    if (x === 6) {
      x = 5;
    }

    for (let y = 0; y < size; y++) {
      for (let i = 0; i < 2; i++) {
        const offsetX = x - i;
        const upward = ((x + 1) & 2) === 0;
        const offsetY = upward ? size - 1 - y : y;

        // Skip the cell if it's not empty.
        if (isEmpty(matrix, offsetX, offsetY)) {
          // Padding bit. If there is no bit left, we'll fill the left cells with 0.
          let bit = 0;

          if (bitIndex < length) {
            bit = codewords.get(bitIndex++);
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
}

// Embed function patterns. On success, modify the matrix.
// The function patterns are:
// - Finder patterns and separators
// - Alignment patterns, if version >= 2
// - Timing patterns
function embedFunctionPatterns(matrix: ByteMatrix, version: Version): void {
  // Let's get started with embedding big squares at corners.
  embedFinderPatternsAndSeparators(matrix);
  // Alignment patterns appear if version >= 2.
  embedAlignmentPatterns(matrix, version);
  // Timing patterns should be embedded after position adj. patterns.
  embedTimingPatterns(matrix);
}

// Embed encoding region. On success, modify the matrix.
// The encoding region are:
// - Format Info
// - Version Info, if version >= 7
// - Data with correction
function embedEncodingRegion(matrix: ByteMatrix, codewords: BitArray, version: Version, ecLevel: ECLevel, mask: number): void {
  // Type information appear with any version.
  embedFormatInfo(matrix, ecLevel, mask);
  // Version info appear if version >= 7.
  embedVersionInfo(matrix, version);
  // Data should be embedded at end.
  embedCodewords(matrix, codewords, mask);
}

// Build 2D matrix of QR Code from "codewords" with "ecLevel", "version" and "getMaskPattern". On
// success, store the result in "matrix".
export function buildMatrix(matrix: ByteMatrix, codewords: BitArray, version: Version, ecLevel: ECLevel, mask: number): void {
  // Clear matrix
  matrix.clear(-1);

  // Embed function patterns
  embedFunctionPatterns(matrix, version);
  // Embed encoding region
  embedEncodingRegion(matrix, codewords, version, ecLevel, mask);
}
