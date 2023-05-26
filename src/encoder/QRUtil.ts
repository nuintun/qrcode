/**
 * @module QRUtil
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { Encoder } from '.';
import * as QRMath from './QRMath';
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

export function getECPolynomial(level: number): Polynomial {
  let e = new Polynomial([1]);

  for (let i = 0; i < level; i++) {
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

function applyMaskPenaltyRule1Internal(encoder: Encoder, isHorizontal: boolean): number {
  let penalty = 0;

  const { size } = encoder;

  for (let i = 0; i < size; i++) {
    let prevBit = false;
    let numSameBitCells = 0;

    for (let j = 0; j < size; j++) {
      const bit = isHorizontal ? encoder.isDark(j, i) : encoder.isDark(i, j);

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

function applyMaskPenaltyRule1(encoder: Encoder): number {
  return applyMaskPenaltyRule1Internal(encoder, true) + applyMaskPenaltyRule1Internal(encoder, false);
}

function applyMaskPenaltyRule2(encoder: Encoder): number {
  let penalty = 0;

  const { size } = encoder;

  for (let i = 0; i < size - 1; i++) {
    for (let j = 0; j < size - 1; j++) {
      const value = encoder.isDark(j, i);

      if (value === encoder.isDark(j + 1, i) && value === encoder.isDark(j, i + 1) && value === encoder.isDark(j + 1, i + 1)) {
        penalty += N2;
      }
    }
  }

  return penalty;
}

function isFourWhite(encoder: Encoder, index: number, from: number, to: number, isHorizontal: boolean): boolean {
  from = Math.max(from, 0);
  to = Math.min(to, encoder.size);

  for (let i = from; i < to; i++) {
    const value = isHorizontal ? encoder.isDark(i, index) : encoder.isDark(index, i);

    if (value) {
      return false;
    }
  }

  return true;
}

function applyMaskPenaltyRule3(encoder: Encoder): number {
  let numPenalties = 0;

  const { size } = encoder;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (
        j + 6 < size &&
        encoder.isDark(j, i) &&
        !encoder.isDark(j + 1, i) &&
        encoder.isDark(j + 2, i) &&
        encoder.isDark(j + 3, i) &&
        encoder.isDark(j + 4, i) &&
        !encoder.isDark(j + 5, i) &&
        encoder.isDark(j + 6, i) &&
        (isFourWhite(encoder, i, j - 4, j, true) || isFourWhite(encoder, i, j + 7, j + 11, true))
      ) {
        numPenalties++;
      }

      if (
        i + 6 < size &&
        encoder.isDark(j, i) &&
        !encoder.isDark(j, i + 1) &&
        encoder.isDark(j, i + 2) &&
        encoder.isDark(j, i + 3) &&
        encoder.isDark(j, i + 4) &&
        !encoder.isDark(j, i + 5) &&
        encoder.isDark(j, i + 6) &&
        (isFourWhite(encoder, j, i - 4, i, false) || isFourWhite(encoder, j, i + 7, i + 11, false))
      ) {
        numPenalties++;
      }
    }
  }

  return numPenalties * N3;
}

function applyMaskPenaltyRule4(encoder: Encoder): number {
  let numDarkCells = 0;

  const { size } = encoder;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (encoder.isDark(j, i)) {
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
 * @param {Encoder} encoder
 * @see https://www.thonky.com/qr-code-tutorial/data-masking
 * @see https://github.com/zxing/zxing/blob/master/core/src/main/java/com/google/zxing/qrcode/encoder/MaskUtil.java
 */
export function calculateMaskPenalty(encoder: Encoder): number {
  return (
    applyMaskPenaltyRule1(encoder) +
    applyMaskPenaltyRule2(encoder) +
    applyMaskPenaltyRule3(encoder) +
    applyMaskPenaltyRule4(encoder)
  );
}
