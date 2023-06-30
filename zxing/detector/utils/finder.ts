/**
 * @module finder
 */

import { BitMatrix } from '/common/BitMatrix';

export const DIFF_EDGE_RATIO = 0.25;
export const DIFF_MODULE_SIZE_RATIO = 0.5;
export const MIN_MODULE_COUNT_PER_EDGE = 11;
export const MAX_MODULE_COUNT_PER_EDGE = 175;

export function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[4] - stateCount[3] - stateCount[2] / 2;
}

export function pushStateCount(stateCount: number[], count: number): void {
  stateCount[0] = stateCount[1];
  stateCount[1] = stateCount[2];
  stateCount[2] = stateCount[3];
  stateCount[3] = stateCount[4];
  stateCount[4] = count;
}

export function getStateCountTotal(stateCount: number[], checkZero?: boolean): number {
  let stateCountTotal = 0;

  for (const count of stateCount) {
    if (checkZero && count === 0) {
      return NaN;
    }

    stateCountTotal += count;
  }

  return stateCountTotal;
}

export function isFoundFinderPattern(stateCount: number[]): boolean {
  const stateCountTotal = getStateCountTotal(stateCount, true);

  if (Number.isNaN(stateCountTotal) || stateCountTotal < 7) {
    return false;
  }

  const moduleSize = stateCountTotal / 7;
  const moduleSizeDiff = moduleSize * DIFF_MODULE_SIZE_RATIO;

  // Allow less than DIFF_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
  return (
    Math.abs(stateCount[0] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[1] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[2] - moduleSize * 3) < moduleSizeDiff * 3 &&
    Math.abs(stateCount[3] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[4] - moduleSize) < moduleSizeDiff
  );
}

export function isFoundAlignmentPattern(stateCount: number[]): boolean {
  const stateCountTotal = getStateCountTotal(stateCount, true);

  if (Number.isNaN(stateCountTotal) || stateCountTotal < 5) {
    return false;
  }

  const moduleSize = stateCountTotal / 5;
  const moduleSizeDiff = moduleSize * DIFF_MODULE_SIZE_RATIO;

  // Allow less than DIFF_MODULE_SIZE_RATIO variance from 1-1-1-1-1 proportions
  return (
    Math.abs(stateCount[0] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[1] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[2] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[3] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[4] - moduleSize) < moduleSizeDiff
  );
}

export function isEqualsEdge(edge1: number, edge2: number): boolean {
  const edgeAvg = (edge1 + edge2) / 2;
  const ratio = Math.abs(edge1 - edge2) / edgeAvg;

  return ratio < DIFF_EDGE_RATIO;
}

export function isEqualsModuleSize(moduleSize1: number, moduleSize2: number): boolean {
  const modeSizeAvg = (moduleSize1 + moduleSize2) / 2;
  const ratio = (moduleSize1 - moduleSize2) / modeSizeAvg;

  return ratio <= DIFF_MODULE_SIZE_RATIO;
}

export function isValidModuleCount(edge: number, moduleSize: number): boolean {
  // Check the sizes
  const moduleCount = Math.ceil(edge / moduleSize);

  return moduleCount >= MIN_MODULE_COUNT_PER_EDGE && moduleCount <= MAX_MODULE_COUNT_PER_EDGE;
}

export function crossPatternCheck(
  matrix: BitMatrix,
  x: number,
  y: number,
  maxCount: number,
  isHorizontal: boolean,
  checker: (stateCount: number[]) => boolean
): number {
  const stateCount = [0, 0, 0, 0, 0];
  const getBit = (offset: number): number => {
    return isHorizontal ? matrix.get(offset, y) : matrix.get(x, offset);
  };

  let offset = isHorizontal ? x : y;

  while (offset >= 0 && getBit(offset)) {
    offset--;
    stateCount[2]++;
  }

  if (offset < 0 || stateCount[2] > maxCount) {
    return NaN;
  }

  while (offset >= 0 && !getBit(offset)) {
    offset--;
    stateCount[1]++;
  }

  if (offset < 0 || stateCount[1] > maxCount) {
    return NaN;
  }

  while (offset >= 0 && getBit(offset)) {
    offset--;
    stateCount[0]++;
  }

  if (offset < 0 || stateCount[0] > maxCount) {
    return NaN;
  }

  offset = (isHorizontal ? x : y) + 1;

  const size = isHorizontal ? matrix.width : matrix.height;

  while (offset < size && getBit(offset)) {
    offset++;
    stateCount[2]++;
  }

  if (offset >= size || stateCount[2] > maxCount) {
    return NaN;
  }

  while (offset < size && !getBit(offset)) {
    offset++;
    stateCount[3]++;
  }

  if (offset >= size || stateCount[3] >= maxCount) {
    return NaN;
  }

  while (offset < size && getBit(offset)) {
    offset++;
    stateCount[4]++;
  }

  if (offset >= size || stateCount[4] >= maxCount) {
    return NaN;
  }

  return checker(stateCount) ? centerFromEnd(stateCount, offset) : NaN;
}
