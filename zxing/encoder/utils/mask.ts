/**
 * @module mask
 */

import { ByteMatrix } from '/encoder/ByteMatrix';

const N1 = 3;
const N2 = 3;
const N3 = 40;
const N4 = 10;

function isDark(matrix: ByteMatrix, x: number, y: number): boolean {
  return matrix.get(x, y) === 1;
}

function applyMaskPenaltyRule1Internal(matrix: ByteMatrix, isHorizontal: boolean): number {
  let penalty = 0;
  let { width, height } = matrix;

  width = isHorizontal ? width : height;
  height = isHorizontal ? height : width;

  for (let y = 0; y < height; y++) {
    let prevBit = false;
    let numSameBitCells = 0;

    for (let x = 0; x < width; x++) {
      const bit = isHorizontal ? isDark(matrix, x, y) : isDark(matrix, y, x);

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

function applyMaskPenaltyRule1(matrix: ByteMatrix): number {
  return applyMaskPenaltyRule1Internal(matrix, true) + applyMaskPenaltyRule1Internal(matrix, false);
}

function applyMaskPenaltyRule2(matrix: ByteMatrix): number {
  let penalty = 0;

  const width = matrix.width - 1;
  const height = matrix.height - 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = isDark(matrix, x, y);

      if (
        // Find 2x2 blocks with the same color
        value === isDark(matrix, x + 1, y) &&
        value === isDark(matrix, x, y + 1) &&
        value === isDark(matrix, x + 1, y + 1)
      ) {
        penalty += N2;
      }
    }
  }

  return penalty;
}

function isFourWhite(matrix: ByteMatrix, offset: number, from: number, to: number, isHorizontal: boolean): boolean {
  from = Math.max(from, 0);
  to = Math.min(to, isHorizontal ? matrix.width : matrix.height);

  for (let i = from; i < to; i++) {
    const value = isHorizontal ? isDark(matrix, i, offset) : isDark(matrix, offset, i);

    if (value) {
      return false;
    }
  }

  return true;
}

function applyMaskPenaltyRule3(matrix: ByteMatrix): number {
  let numPenalties = 0;

  const { width, height } = matrix;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000
        x + 6 < width &&
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
        y + 6 < height &&
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

function applyMaskPenaltyRule4(matrix: ByteMatrix): number {
  let numDarkCells = 0;

  const { width, height } = matrix;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isDark(matrix, x, y)) {
        numDarkCells++;
      }
    }
  }

  const numTotalCells = width * height;
  const fivePercentVariances = (Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells;

  return fivePercentVariances * N4;
}

export function calculateMaskPenalty(matrix: ByteMatrix): number {
  return (
    applyMaskPenaltyRule1(matrix) +
    applyMaskPenaltyRule2(matrix) +
    applyMaskPenaltyRule3(matrix) +
    applyMaskPenaltyRule4(matrix)
  );
}

export function getDataMaskBit(mask: number, x: number, y: number): boolean {
  let temp: number;
  let intermediate: number;

  switch (mask) {
    case 0:
      intermediate = (y + x) & 0x1;
      break;
    case 1:
      intermediate = y & 0x1;
      break;
    case 2:
      intermediate = x % 3;
      break;
    case 3:
      intermediate = (y + x) % 3;
      break;
    case 4:
      intermediate = (y / 2 + x / 3) & 0x1;
      break;
    case 5:
      temp = y * x;
      intermediate = (temp & 0x1) + (temp % 3);
      break;
    case 6:
      temp = y * x;
      intermediate = ((temp & 0x1) + (temp % 3)) & 0x1;
      break;
    case 7:
      intermediate = (((y * x) % 3) + ((y + x) & 0x1)) & 0x1;
      break;
    default:
      throw new Error(`illegal mask: ${mask}`);
  }

  return intermediate === 0;
}
