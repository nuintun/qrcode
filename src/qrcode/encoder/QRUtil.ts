/**
 * @module QRUtil
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as QRMath from './QRMath';
import { Encoder } from './Writer';
import { Polynomial } from './Polynomial';

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

export function getErrorCorrectionPolynomial(errorCorrectionLength: number): Polynomial {
  let e = new Polynomial([1]);

  for (let i = 0; i < errorCorrectionLength; i++) {
    e = e.multiply(new Polynomial([1, QRMath.gexp(i)]));
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

function applyMaskPenaltyRule1Internal(qrcode: Encoder, isHorizontal: boolean): number {
  const matrixSize = qrcode.getMatrixSize();

  let penalty = 0;

  for (let i = 0; i < matrixSize; i++) {
    let prevBit = false;
    let numSameBitCells = 0;

    for (let j = 0; j < matrixSize; j++) {
      const bit = isHorizontal ? qrcode.isDark(i, j) : qrcode.isDark(j, i);

      if (bit === prevBit) {
        numSameBitCells++;

        if (numSameBitCells === 5) {
          penalty += N1;
        } else if (numSameBitCells > 5) {
          penalty++;
        }
      } else {
        // set prev bit
        prevBit = bit;
        // include the cell itself
        numSameBitCells = 1;
      }
    }
  }

  return penalty;
}

function applyMaskPenaltyRule1(qrcode: Encoder): number {
  return applyMaskPenaltyRule1Internal(qrcode, true) + applyMaskPenaltyRule1Internal(qrcode, false);
}

function applyMaskPenaltyRule2(qrcode: Encoder): number {
  const matrixSize = qrcode.getMatrixSize();

  let penalty = 0;

  for (let y = 0; y < matrixSize - 1; y++) {
    for (let x = 0; x < matrixSize - 1; x++) {
      const value = qrcode.isDark(y, x);

      if (value === qrcode.isDark(y, x + 1) && value === qrcode.isDark(y + 1, x) && value === qrcode.isDark(y + 1, x + 1)) {
        penalty += N2;
      }
    }
  }

  return penalty;
}

function isFourWhite(qrcode: Encoder, rangeIndex: number, from: number, to: number, isHorizontal: boolean): boolean {
  from = Math.max(from, 0);
  to = Math.min(to, qrcode.getMatrixSize());

  for (let i = from; i < to; i++) {
    const value = isHorizontal ? qrcode.isDark(rangeIndex, i) : qrcode.isDark(i, rangeIndex);

    if (value) {
      return false;
    }
  }

  return true;
}

function applyMaskPenaltyRule3(qrcode: Encoder): number {
  const matrixSize = qrcode.getMatrixSize();

  let penalty = 0;

  for (let y = 0; y < matrixSize; y++) {
    for (let x = 0; x < matrixSize; x++) {
      if (
        x + 6 < matrixSize &&
        qrcode.isDark(y, x) &&
        !qrcode.isDark(y, x + 1) &&
        qrcode.isDark(y, x + 2) &&
        qrcode.isDark(y, x + 3) &&
        qrcode.isDark(y, x + 4) &&
        !qrcode.isDark(y, x + 5) &&
        qrcode.isDark(y, x + 6) &&
        (isFourWhite(qrcode, y, x - 4, x, true) || isFourWhite(qrcode, y, x + 7, x + 11, true))
      ) {
        penalty += N3;
      }

      if (
        y + 6 < matrixSize &&
        qrcode.isDark(y, x) &&
        !qrcode.isDark(y + 1, x) &&
        qrcode.isDark(y + 2, x) &&
        qrcode.isDark(y + 3, x) &&
        qrcode.isDark(y + 4, x) &&
        !qrcode.isDark(y + 5, x) &&
        qrcode.isDark(y + 6, x) &&
        (isFourWhite(qrcode, x, y - 4, y, false) || isFourWhite(qrcode, x, y + 7, y + 11, false))
      ) {
        penalty += N3;
      }
    }
  }

  return penalty;
}

function applyMaskPenaltyRule4(qrcode: Encoder): number {
  const matrixSize = qrcode.getMatrixSize();

  let numDarkCells = 0;

  for (let y = 0; y < matrixSize; y++) {
    for (let x = 0; x < matrixSize; x++) {
      if (qrcode.isDark(y, x)) {
        numDarkCells++;
      }
    }
  }

  const numTotalCells = matrixSize * matrixSize;
  const fivePercentVariances = Math.floor(Math.abs(numDarkCells * 20 - numTotalCells * 10) / numTotalCells);

  return fivePercentVariances * N4;
}

/**
 * @function calculateMaskPenalty
 * @param {Encoder} qrcode
 * @see https://www.thonky.com/qr-code-tutorial/data-masking
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
 */
export function calculateMaskPenalty(qrcode: Encoder): number {
  return (
    applyMaskPenaltyRule1(qrcode) +
    applyMaskPenaltyRule2(qrcode) +
    applyMaskPenaltyRule3(qrcode) +
    applyMaskPenaltyRule4(qrcode)
  );
}
