/**
 * @module utils
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { gexp } from './math';
import { Mode } from '/common/Mode';
import { Polynomial } from './Polynomial';
import { isDark, Matrix } from './Matrix';

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

function applyMaskPenaltyRule1Internal(matrix: Matrix, isHorizontal: boolean): number {
  let penalty = 0;

  const { size } = matrix;

  for (let i = 0; i < size; i++) {
    let prevBit = false;
    let numSameBitCells = 0;

    for (let j = 0; j < size; j++) {
      const bit = isHorizontal ? isDark(matrix, j, i) : isDark(matrix, i, j);

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

function applyMaskPenaltyRule1(matrix: Matrix): number {
  return applyMaskPenaltyRule1Internal(matrix, true) + applyMaskPenaltyRule1Internal(matrix, false);
}

function applyMaskPenaltyRule2(matrix: Matrix): number {
  let penalty = 0;

  const { size } = matrix;

  for (let i = 0; i < size - 1; i++) {
    for (let j = 0; j < size - 1; j++) {
      const value = isDark(matrix, j, i);

      if (value === isDark(matrix, j + 1, i) && value === isDark(matrix, j, i + 1) && value === isDark(matrix, j + 1, i + 1)) {
        penalty += N2;
      }
    }
  }

  return penalty;
}

function isFourWhite(matrix: Matrix, index: number, from: number, to: number, isHorizontal: boolean): boolean {
  from = Math.max(from, 0);
  to = Math.min(to, matrix.size);

  for (let i = from; i < to; i++) {
    const value = isHorizontal ? isDark(matrix, i, index) : isDark(matrix, index, i);

    if (value) {
      return false;
    }
  }

  return true;
}

function applyMaskPenaltyRule3(matrix: Matrix): number {
  let numPenalties = 0;

  const { size } = matrix;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (
        j + 6 < size &&
        isDark(matrix, j, i) &&
        !isDark(matrix, j + 1, i) &&
        isDark(matrix, j + 2, i) &&
        isDark(matrix, j + 3, i) &&
        isDark(matrix, j + 4, i) &&
        !isDark(matrix, j + 5, i) &&
        isDark(matrix, j + 6, i) &&
        (isFourWhite(matrix, i, j - 4, j, true) || isFourWhite(matrix, i, j + 7, j + 11, true))
      ) {
        numPenalties++;
      }

      if (
        i + 6 < size &&
        isDark(matrix, j, i) &&
        !isDark(matrix, j, i + 1) &&
        isDark(matrix, j, i + 2) &&
        isDark(matrix, j, i + 3) &&
        isDark(matrix, j, i + 4) &&
        !isDark(matrix, j, i + 5) &&
        isDark(matrix, j, i + 6) &&
        (isFourWhite(matrix, j, i - 4, i, false) || isFourWhite(matrix, j, i + 7, i + 11, false))
      ) {
        numPenalties++;
      }
    }
  }

  return numPenalties * N3;
}

function applyMaskPenaltyRule4(matrix: Matrix): number {
  let numDarkCells = 0;

  const { size } = matrix;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (isDark(matrix, j, i)) {
        numDarkCells++;
      }
    }
  }

  const numTotalCells = size * size;
  const fivePercentVariances = (Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells;

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
