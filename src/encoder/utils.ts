/**
 * @module utils
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { gexp } from './math';
import { Mode } from '../common/Mode';
import { Polynomial } from './Polynomial';
import { isDark, Matrix } from './Matrix';

// Penalty weights from section 6.8.2.1
const N1 = 3;
const N2 = 3;
const N3 = 40;
const N4 = 10;

const ALIGNMENT_PATTERN_TABLE = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170]
];

const G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

const G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

const G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

export function getAlignmentPattern(version: number): number[] {
  return ALIGNMENT_PATTERN_TABLE[version - 1];
}

export function getECPolynomial(level: number): Polynomial {
  let e = new Polynomial([1]);

  for (let i = 0; i < level; i++) {
    e = e.multiply(new Polynomial([1, gexp(i)]));
  }

  return e;
}

function getBCHDigit(data: number): number {
  let digit = 0;

  while (data !== 0) {
    digit++;
    data >>>= 1;
  }

  return digit;
}

const G18_BCH = getBCHDigit(G18);

export function getBCHVersion(data: number): number {
  let offset = data << 12;

  while (getBCHDigit(offset) - G18_BCH >= 0) {
    offset ^= G18 << (getBCHDigit(offset) - G18_BCH);
  }

  return (data << 12) | offset;
}

const G15_BCH = getBCHDigit(G15);

export function getBCHVersionInfo(data: number): number {
  let offset = data << 10;

  while (getBCHDigit(offset) - G15_BCH >= 0) {
    offset ^= G15 << (getBCHDigit(offset) - G15_BCH);
  }

  return ((data << 10) | offset) ^ G15_MASK;
}

// Helper function for applyMaskPenaltyRule1. We need this for doing this calculation in both
// vertical and horizontal orders respectively.
function applyMaskPenaltyRule1Internal(matrix: Matrix, isHorizontal: boolean): number {
  let penalty = 0;

  const { size } = matrix;

  for (let y = 0; y < size; y++) {
    let prevBit = -1;
    let numSameBitCells = 0;

    for (let x = 0; x < size; x++) {
      const bit = isHorizontal ? matrix.get(x, y) : matrix.get(y, x);

      if (bit === prevBit) {
        numSameBitCells++;
      } else {
        if (numSameBitCells >= 5) {
          penalty += N1 + (numSameBitCells - 5);
        }

        // set prev bit
        prevBit = bit;
        // include the cell itself
        numSameBitCells = 1;
      }
    }

    if (numSameBitCells >= 5) {
      penalty += N1 + (numSameBitCells - 5);
    }
  }

  return penalty;
}

// Apply mask penalty rule 1 and return the penalty. Find repetitive cells with the same color and
// give penalty to them. Example: 00000 or 11111.
function applyMaskPenaltyRule1(matrix: Matrix): number {
  return applyMaskPenaltyRule1Internal(matrix, true) + applyMaskPenaltyRule1Internal(matrix, false);
}

// Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
// penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
// penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
function applyMaskPenaltyRule2(matrix: Matrix): number {
  let penalty = 0;

  const size = matrix.size - 1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bit = matrix.get(x, y);

      if (
        // Find 2x2 blocks with the same color
        bit === matrix.get(x + 1, y) &&
        bit === matrix.get(x, y + 1) &&
        bit === matrix.get(x + 1, y + 1)
      ) {
        penalty += N2;
      }
    }
  }

  return penalty;
}

// Is is four white, check on horizontal and vertical.
function isFourWhite(matrix: Matrix, offset: number, from: number, to: number, isHorizontal: boolean): boolean {
  if (from < 0 || to > matrix.size) {
    return false;
  }

  for (let i = from; i < to; i++) {
    if (isHorizontal ? isDark(matrix, i, offset) : isDark(matrix, offset, i)) {
      return false;
    }
  }

  return true;
}

// Apply mask penalty rule 3 and return the penalty. Find consecutive runs of 1:1:3:1:1:4
// starting with black, or 4:1:1:3:1:1 starting with white, and give penalty to them. If we
// find patterns like 000010111010000, we give penalty once.
function applyMaskPenaltyRule3(matrix: Matrix): number {
  let numPenalties = 0;

  const { size } = matrix;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (
        // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
        x + 6 < size &&
        isDark(matrix, x, y) &&
        !isDark(matrix, x + 1, y) &&
        isDark(matrix, x + 2, y) &&
        isDark(matrix, x + 3, y) &&
        isDark(matrix, x + 4, y) &&
        !isDark(matrix, x + 5, y) &&
        isDark(matrix, x + 6, y) &&
        (isFourWhite(matrix, y, x - 4, x, true) || isFourWhite(matrix, y, x + 7, x + 11, true))
      ) {
        numPenalties++;
      }

      if (
        // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
        y + 6 < size &&
        isDark(matrix, x, y) &&
        !isDark(matrix, x, y + 1) &&
        isDark(matrix, x, y + 2) &&
        isDark(matrix, x, y + 3) &&
        isDark(matrix, x, y + 4) &&
        !isDark(matrix, x, y + 5) &&
        isDark(matrix, x, y + 6) &&
        (isFourWhite(matrix, x, y - 4, y, false) || isFourWhite(matrix, x, y + 7, y + 11, false))
      ) {
        numPenalties++;
      }
    }
  }

  return numPenalties * N3;
}

// Apply mask penalty rule 4 and return the penalty. Calculate the ratio of dark cells and give
// penalty if the ratio is far from 50%. It gives 10 penalty for 5% distance.
function applyMaskPenaltyRule4(matrix: Matrix): number {
  let numDarkCells = 0;

  const { size } = matrix;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isDark(matrix, x, y)) {
        numDarkCells++;
      }
    }
  }

  const numTotalCells = size * size;
  const fivePercentVariances = Math.floor((Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells);

  return fivePercentVariances * N4;
}

/**
 * @function calculateMaskPenalty
 * @param {Matrix} matrix
 * @see https://www.thonky.com/qr-code-tutorial/data-masking
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
 */
export function calculateMaskPenalty(matrix: Matrix): number {
  return (
    applyMaskPenaltyRule1(matrix) +
    applyMaskPenaltyRule2(matrix) +
    applyMaskPenaltyRule3(matrix) +
    applyMaskPenaltyRule4(matrix)
  );
}

export function getCharacterCountBits(mode: Mode, version: number): number | never {
  const error = new Error(`illegal mode: ${mode}`);

  if (1 <= version && version < 10) {
    // 1 - 9
    switch (mode) {
      case Mode.NUMERIC:
        return 10;
      case Mode.ALPHANUMERIC:
        return 9;
      case Mode.BYTE:
        return 8;
      case Mode.KANJI:
        return 8;
      default:
        throw error;
    }
  } else if (version < 27) {
    // 10 - 26
    switch (mode) {
      case Mode.NUMERIC:
        return 12;
      case Mode.ALPHANUMERIC:
        return 11;
      case Mode.BYTE:
        return 16;
      case Mode.KANJI:
        return 10;
      default:
        throw error;
    }
  } else if (version < 41) {
    // 27 - 40
    switch (mode) {
      case Mode.NUMERIC:
        return 14;
      case Mode.ALPHANUMERIC:
        return 13;
      case Mode.BYTE:
        return 16;
      case Mode.KANJI:
        return 12;
      default:
        throw error;
    }
  } else {
    throw new Error(`illegal version: ${version}`);
  }
}
