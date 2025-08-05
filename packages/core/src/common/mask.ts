/**
 * @module mask
 */

import { toInt32 } from './utils';
import { ByteMatrix } from './ByteMatrix';

// Penalty weights.
const N1 = 3;
const N2 = 3;
const N3 = 40;
const N4 = 10;

// Is dark point.
function isDark(matrix: ByteMatrix, x: number, y: number): boolean {
  return matrix.get(x, y) === 1;
}

// Helper function for applyMaskPenaltyRule1. We need this for doing this calculation in both
// horizontal and vertical orders respectively.
function applyMaskPenaltyRule1Internal(matrix: ByteMatrix, isVertical?: boolean): number {
  let penalty = 0;

  const { size } = matrix;

  for (let y = 0; y < size; y++) {
    let prevBit = -1;
    let numSameBitCells = 0;

    for (let x = 0; x < size; x++) {
      const bit = isVertical ? matrix.get(y, x) : matrix.get(x, y);

      if (bit === prevBit) {
        numSameBitCells++;
      } else {
        if (numSameBitCells >= 5) {
          penalty += N1 + (numSameBitCells - 5);
        }

        // set prev bit.
        prevBit = bit;
        // include the cell itself.
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
function applyMaskPenaltyRule1(matrix: ByteMatrix): number {
  return applyMaskPenaltyRule1Internal(matrix) + applyMaskPenaltyRule1Internal(matrix, true);
}

// Apply mask penalty rule 2 and return the penalty. Find 2x2 blocks with the same color and give
// penalty to them. This is actually equivalent to the spec's rule, which is to find MxN blocks and give a
// penalty proportional to (M-1)x(N-1), because this is the number of 2x2 blocks inside such a block.
function applyMaskPenaltyRule2(matrix: ByteMatrix): number {
  let penalty = 0;

  const size = matrix.size - 1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bit = matrix.get(x, y);

      if (
        // Find 2x2 blocks with the same color.
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
function isFourWhite(matrix: ByteMatrix, offset: number, from: number, to: number, isVertical?: boolean): boolean {
  if (from < 0 || to > matrix.size) {
    return false;
  }

  for (let i = from; i < to; i++) {
    if (isVertical ? isDark(matrix, offset, i) : isDark(matrix, i, offset)) {
      return false;
    }
  }

  return true;
}

// Apply mask penalty rule 3 and return the penalty. Find consecutive runs of 1:1:3:1:1:4
// starting with black, or 4:1:1:3:1:1 starting with white, and give penalty to them. If we
// find patterns like 000010111010000, we give penalty once.
function applyMaskPenaltyRule3(matrix: ByteMatrix): number {
  let numPenalties = 0;

  const { size } = matrix;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (
        // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000.
        x + 6 < size &&
        isDark(matrix, x, y) &&
        !isDark(matrix, x + 1, y) &&
        isDark(matrix, x + 2, y) &&
        isDark(matrix, x + 3, y) &&
        isDark(matrix, x + 4, y) &&
        !isDark(matrix, x + 5, y) &&
        isDark(matrix, x + 6, y) &&
        (isFourWhite(matrix, y, x - 4, x) || isFourWhite(matrix, y, x + 7, x + 11))
      ) {
        numPenalties++;
      }

      if (
        // Find consecutive runs of 1:1:3:1:1:4 or 4:1:1:3:1:1, patterns like 000010111010000.
        y + 6 < size &&
        isDark(matrix, x, y) &&
        !isDark(matrix, x, y + 1) &&
        isDark(matrix, x, y + 2) &&
        isDark(matrix, x, y + 3) &&
        isDark(matrix, x, y + 4) &&
        !isDark(matrix, x, y + 5) &&
        isDark(matrix, x, y + 6) &&
        (isFourWhite(matrix, x, y - 4, y, true) || isFourWhite(matrix, x, y + 7, y + 11, true))
      ) {
        numPenalties++;
      }
    }
  }

  return numPenalties * N3;
}

// Apply mask penalty rule 4 and return the penalty. Calculate the ratio of dark cells and give
// penalty if the ratio is far from 50%. It gives 10 penalty for 5% distance.
function applyMaskPenaltyRule4(matrix: ByteMatrix): number {
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
  const fivePercentVariances = toInt32((Math.abs(numDarkCells * 2 - numTotalCells) * 10) / numTotalCells);

  return fivePercentVariances * N4;
}

// The mask penalty calculation is complicated. See Table 11 of ISO/IEC 18004:2015(E)(p.54) for details.
// Basically it applies four rules and summate all penalties.
export function calculateMaskPenalty(matrix: ByteMatrix): number {
  return (
    applyMaskPenaltyRule1(matrix) +
    applyMaskPenaltyRule2(matrix) +
    applyMaskPenaltyRule3(matrix) +
    applyMaskPenaltyRule4(matrix)
  );
}

// Return is apply mask at "x" and "y". See 7.8 of ISO/IEC 18004:2015(E)(p.50) for mask pattern conditions.
export function isApplyMask(mask: number, x: number, y: number): boolean {
  let temporary: number;
  let intermediate: number;

  switch (mask) {
    case 0:
      intermediate = (y + x) & 0x01;
      break;
    case 1:
      intermediate = y & 0x01;
      break;
    case 2:
      intermediate = x % 3;
      break;
    case 3:
      intermediate = (y + x) % 3;
      break;
    case 4:
      intermediate = (toInt32(y / 2) + toInt32(x / 3)) & 0x01;
      break;
    case 5:
      temporary = y * x;
      intermediate = (temporary & 0x01) + (temporary % 3);
      break;
    case 6:
      temporary = y * x;
      intermediate = ((temporary & 0x01) + (temporary % 3)) & 0x01;
      break;
    case 7:
      intermediate = (((y * x) % 3) + ((y + x) & 0x01)) & 0x01;
      break;
    default:
      throw new Error(`illegal mask: ${mask}`);
  }

  return intermediate === 0;
}
