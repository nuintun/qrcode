/**
 * @module finder
 */

import { toInt32 } from '/common/utils';
import { Pattern } from '/detector/Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { isPointInQuadrangle, Point } from '/common/Point';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';

export const DIFF_EDGE_RATIO = 0.25;
export const DIFF_MODULE_SIZE_RATIO = 0.5;
export const MIN_MODULE_COUNT_PER_EDGE = 11;
export const MAX_MODULE_COUNT_PER_EDGE = 175;

export function centerFromStart(stateCount: number[], start: number): number {
  const { length } = stateCount;
  const middleIndex = toInt32(length / 2);

  let center = start + stateCount[middleIndex] / 2;

  for (let i = 0; i < middleIndex; i++) {
    center += stateCount[i];
  }

  return center;
}

export function centerFromEnd(stateCount: number[], end: number): number {
  const { length } = stateCount;
  const middleIndex = toInt32(length / 2);

  let center = end - stateCount[middleIndex] / 2;

  for (let i = middleIndex + 1; i < length; i++) {
    center -= stateCount[i];
  }

  return center;
}

export function shiftStateCount(stateCount: number[], count: number): void {
  const { length } = stateCount;

  for (let i = length - 1; i > 0; i--) {
    stateCount[i] = stateCount[i - 1];
  }

  stateCount[0] = count;
}

export function pushStateCount(stateCount: number[], count: number): void {
  const { length } = stateCount;
  const lastIndex = length - 1;

  for (let i = 0; i < lastIndex; i++) {
    stateCount[i] = stateCount[i + 1];
  }

  stateCount[lastIndex] = count;
}

export function getStateCountTotal(stateCount: number[], checkZero?: boolean): number {
  let stateCountTotal = 0;

  for (const count of stateCount) {
    if (checkZero && count === 0) {
      return -1;
    }

    stateCountTotal += count;
  }

  return stateCountTotal;
}

export function isFoundFinderPattern(stateCount: number[]): boolean {
  const moduleCount = 7;
  const { length } = stateCount;
  const stateCountTotal = getStateCountTotal(stateCount, true);

  if (stateCountTotal >= moduleCount) {
    const middleIndex = toInt32(length / 2);
    const moduleSize = stateCountTotal / moduleCount;
    const moduleSizeDiff = moduleSize * DIFF_MODULE_SIZE_RATIO;

    // Allow less than DIFF_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
    for (let i = 0; i < length; i++) {
      const size = stateCount[i];
      const ratio = i !== middleIndex ? 1 : 3;

      if (Math.abs(size - moduleSize * ratio) > moduleSizeDiff * ratio) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function isFoundAlignmentPattern(stateCount: number[]): boolean {
  const moduleCount = stateCount.length;
  const stateCountTotal = getStateCountTotal(stateCount, true);

  if (stateCountTotal >= moduleCount) {
    const moduleSize = stateCountTotal / moduleCount;
    const moduleSizeDiff = moduleSize * DIFF_MODULE_SIZE_RATIO;

    // Allow less than DIFF_MODULE_SIZE_RATIO variance from 1-1-1 or 1-1-1-1-1 proportions
    for (const size of stateCount) {
      if (Math.abs(size - moduleSize) > moduleSizeDiff) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function isEqualsEdge(edge1: number, edge2: number): boolean {
  const edgeAvg = (edge1 + edge2) / 2;
  const ratio = Math.abs(edge1 - edge2) / edgeAvg;

  return ratio < DIFF_EDGE_RATIO;
}

export function isEqualsModuleSize(moduleSize1: number, moduleSize2: number): boolean {
  const modeSizeAvg = (moduleSize1 + moduleSize2) / 2;
  const ratio = Math.abs(moduleSize1 - moduleSize2) / modeSizeAvg;

  return ratio <= DIFF_MODULE_SIZE_RATIO;
}

export function isValidModuleCount(edge: number, moduleSize: number): boolean {
  // Check the sizes
  const moduleCount = Math.ceil(edge / moduleSize);

  return moduleCount >= MIN_MODULE_COUNT_PER_EDGE && moduleCount <= MAX_MODULE_COUNT_PER_EDGE;
}

export function isInFinderPatternGroup({ topLeft, topRight, bottomLeft }: FinderPatternGroup, pattern: Pattern): boolean {
  // Guess where a "bottom right" finder pattern would have been
  const bottomRight = new Point(topRight.x - topLeft.x + bottomLeft.x, topRight.y - topLeft.y + bottomLeft.y);

  return isPointInQuadrangle(pattern, topLeft, topRight, bottomRight, bottomLeft);
}

export function alignCrossPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  moduleSize: number,
  isHorizontal: boolean,
  checker: (stateCount: number[]) => boolean
): number {
  let offset = isHorizontal ? x : y;

  const stateCount = [0, 0, 0, 0, 0];
  const isBlackPixel = (): number => {
    return isHorizontal ? matrix.get(offset, y) : matrix.get(x, offset);
  };

  while (offset >= 0 && isBlackPixel()) {
    offset--;
    stateCount[2]++;
  }

  while (offset >= 0 && !isBlackPixel()) {
    offset--;
    stateCount[1]++;
  }

  while (offset >= 0 && stateCount[0] < moduleSize && isBlackPixel()) {
    offset--;
    stateCount[0]++;
  }

  offset = (isHorizontal ? x : y) + 1;

  const size = isHorizontal ? matrix.width : matrix.height;

  while (offset < size && isBlackPixel()) {
    offset++;
    stateCount[2]++;
  }

  while (offset < size && !isBlackPixel()) {
    offset++;
    stateCount[3]++;
  }

  while (offset < size && stateCount[4] < moduleSize && isBlackPixel()) {
    offset++;
    stateCount[4]++;
  }

  return checker(stateCount) ? centerFromEnd(stateCount, offset) : NaN;
}

export function checkDiagonalPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  moduleSize: number,
  isBackslash: boolean,
  checker: (stateCount: number[]) => boolean
): boolean {
  let offset = 0;

  const stateCount = [0, 0, 0, 0, 0];
  const isBlackPixel = (isUpward: boolean): number => {
    if (isBackslash) {
      return isUpward ? matrix.get(x - offset, y - offset) : matrix.get(x + offset, y + offset);
    } else {
      return isUpward ? matrix.get(x + offset, y - offset) : matrix.get(x - offset, y + offset);
    }
  };

  // Start counting up, left from center finding black center mass
  while (x >= offset && y >= offset && isBlackPixel(true)) {
    offset++;
    stateCount[2]++;
  }

  // Continue up, left finding white space
  while (x >= offset && y >= offset && !isBlackPixel(true)) {
    offset++;
    stateCount[1]++;
  }

  // Continue up, left finding black border
  while (x >= offset && y >= offset && stateCount[0] < moduleSize && isBlackPixel(true)) {
    offset++;
    stateCount[0]++;
  }

  offset = 1;

  const { width, height } = matrix;

  while (x + offset < width && y + offset < height && isBlackPixel(false)) {
    offset++;
    stateCount[2]++;
  }

  while (x + offset < width && y + offset < height && !isBlackPixel(false)) {
    offset++;
    stateCount[3]++;
  }

  while (x + offset < width && y + offset < height && stateCount[4] < moduleSize && isBlackPixel(false)) {
    offset++;
    stateCount[4]++;
  }

  return checker(stateCount);
}
