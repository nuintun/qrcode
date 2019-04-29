/**
 * @module QRUtil
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRCode from './QRCode';
import * as QRMath from './QRMath';
import Polynomial from './Polynomial';

const N1: number = 3;
const N2: number = 3;
const N3: number = 40;
const N4: number = 10;

const ALIGNMENT_PATTERN_TABLE: number[][] = [
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

const G15_MASK: number = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

const G15: number = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);

const G18: number = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);

export type maskFunc = (x: number, y: number) => boolean;

export function getAlignmentPattern(version: number): number[] {
  return ALIGNMENT_PATTERN_TABLE[version - 1];
}

export function getErrorCorrectionPolynomial(errorCorrectionLength: number): Polynomial {
  let e: Polynomial = new Polynomial([1]);

  for (let i: number = 0; i < errorCorrectionLength; i++) {
    e = e.multiply(new Polynomial([1, QRMath.gexp(i)]));
  }

  return e;
}

function getBCHDigit(data: number): number {
  let digit: number = 0;

  while (data !== 0) {
    digit++;
    data >>>= 1;
  }

  return digit;
}

export function getBCHVersion(data: number): number {
  let offset: number = data << 12;

  while (getBCHDigit(offset) - getBCHDigit(G18) >= 0) {
    offset ^= G18 << (getBCHDigit(offset) - getBCHDigit(G18));
  }

  return (data << 12) | offset;
}

export function getBCHVersionInfo(data: number): number {
  let offset: number = data << 10;

  while (getBCHDigit(offset) - getBCHDigit(G15) >= 0) {
    offset ^= G15 << (getBCHDigit(offset) - getBCHDigit(G15));
  }

  return ((data << 10) | offset) ^ G15_MASK;
}

function applyMaskPenaltyRule1Internal(qrcode: QRCode, isHorizontal: boolean): number {
  let penalty: number = 0;
  const moduleCount: number = qrcode.getModuleCount();

  for (let i: number = 0; i < moduleCount; i++) {
    let prevBit: boolean = null;
    let numSameBitCells: number = 0;

    for (let j: number = 0; j < moduleCount; j++) {
      const bit: boolean = isHorizontal ? qrcode.isDark(i, j) : qrcode.isDark(j, i);

      if (bit === prevBit) {
        numSameBitCells++;
      } else {
        if (numSameBitCells >= 5) {
          penalty += N1 + (numSameBitCells - 5);
        }

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

function applyMaskPenaltyRule1(qrcode: QRCode): number {
  return applyMaskPenaltyRule1Internal(qrcode, true) + applyMaskPenaltyRule1Internal(qrcode, false);
}

function applyMaskPenaltyRule2(qrcode: QRCode): number {
  let penalty: number = 0;
  const moduleCount: number = qrcode.getModuleCount();

  for (let y: number = 0; y < moduleCount - 1; y++) {
    for (let x: number = 0; x < moduleCount - 1; x++) {
      const value: boolean = qrcode.isDark(y, x);

      if (value === qrcode.isDark(y, x + 1) && value === qrcode.isDark(y + 1, x) && value === qrcode.isDark(y + 1, x + 1)) {
        penalty++;
      }
    }
  }

  return N2 * penalty;
}

function isFourWhite(qrcode: QRCode, rangeIndex: number, from: number, to: number, isHorizontal: boolean): boolean {
  from = Math.max(from, 0);
  to = Math.min(to, qrcode.getModuleCount());

  for (let i: number = from; i < to; i++) {
    const value: boolean = isHorizontal ? qrcode.isDark(rangeIndex, i) : qrcode.isDark(i, rangeIndex);

    if (value) {
      return false;
    }
  }

  return true;
}

function applyMaskPenaltyRule3(qrcode: QRCode): number {
  let numPenalties: number = 0;
  const moduleCount: number = qrcode.getModuleCount();

  for (let y: number = 0; y < moduleCount; y++) {
    for (let x: number = 0; x < moduleCount; x++) {
      if (
        x + 6 < moduleCount &&
        qrcode.isDark(y, x) &&
        !qrcode.isDark(y, x + 1) &&
        qrcode.isDark(y, x + 2) &&
        qrcode.isDark(y, x + 3) &&
        qrcode.isDark(y, x + 4) &&
        !qrcode.isDark(y, x + 5) &&
        qrcode.isDark(y, x + 6) &&
        (isFourWhite(qrcode, y, x - 4, x, true) || isFourWhite(qrcode, y, x + 7, x + 11, true))
      ) {
        numPenalties++;
      }
      if (
        y + 6 < moduleCount &&
        qrcode.isDark(y, x) &&
        !qrcode.isDark(y + 1, x) &&
        qrcode.isDark(y + 2, x) &&
        qrcode.isDark(y + 3, x) &&
        qrcode.isDark(y + 4, x) &&
        !qrcode.isDark(y + 5, x) &&
        qrcode.isDark(y + 6, x) &&
        (isFourWhite(qrcode, x, y - 4, y, false) || isFourWhite(qrcode, x, y + 7, y + 11, false))
      ) {
        numPenalties++;
      }
    }
  }

  return numPenalties * N3;
}

function applyMaskPenaltyRule4(qrcode: QRCode): number {
  let numDarkCells: number = 0;
  const moduleCount: number = qrcode.getModuleCount();

  for (let y: number = 0; y < moduleCount; y++) {
    for (let x: number = 0; x < moduleCount; x++) {
      if (qrcode.isDark(y, x)) {
        numDarkCells++;
      }
    }
  }

  const numTotalCells: number = moduleCount * moduleCount;
  const fivePercentVariances: number = Math.floor((Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells);

  return fivePercentVariances * N4;
}

/**
 * @function calculateMaskPenalty
 * @param {QRCode} qrcode
 * @see https://www.thonky.com/qr-code-tutorial/data-masking
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
 */
export function calculateMaskPenalty(qrcode: QRCode): number {
  return (
    applyMaskPenaltyRule1(qrcode) +
    applyMaskPenaltyRule2(qrcode) +
    applyMaskPenaltyRule3(qrcode) +
    applyMaskPenaltyRule4(qrcode)
  );
}
