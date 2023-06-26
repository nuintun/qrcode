/**
 * @module FinderPatternFinder
 */

import { FinderPattern } from './FinderPattern';
import { BitMatrix } from '/common/BitMatrix';

const MIN_SKIP = 3;
const MAX_MODULES = 97;
const CENTER_QUORUM = 2;
const DIFF_MODSIZE_CUTOFF = 0.5;
const MIN_MODULE_COUNT_PER_EDGE = 9;
const MAX_MODULE_COUNT_PER_EDGE = 180;
const DIFF_MODSIZE_CUTOFF_PERCENT = 0.05;

function shiftTwoCount(stateCount: number[]): void {
  stateCount[0] = stateCount[2];
  stateCount[1] = stateCount[3];
  stateCount[2] = stateCount[4];
  stateCount[3] = 1;
  stateCount[4] = 0;
}

function isFoundPattern(stateCount: number[], threshold: number): boolean {
  let totalModuleSize = 0;

  for (let i = 0; i < 5; i++) {
    const count = stateCount[i];

    if (count === 0) {
      return false;
    }

    totalModuleSize += count;
  }

  if (totalModuleSize < 7) {
    return false;
  }

  const moduleSize = totalModuleSize / 7;
  const maxVariance = moduleSize / threshold;

  // Allow less than 50% variance from 1-1-3-1-1 proportions
  return (
    Math.abs(moduleSize - stateCount[0]) < maxVariance &&
    Math.abs(moduleSize - stateCount[1]) < maxVariance &&
    Math.abs(3 * moduleSize - stateCount[2]) < 3 * maxVariance &&
    Math.abs(moduleSize - stateCount[3]) < maxVariance &&
    Math.abs(moduleSize - stateCount[4]) < maxVariance
  );
}

function isFoundPatternCross(stateCount: number[]): boolean {
  return isFoundPattern(stateCount, 2);
}

function isFoundPatternDiagonal(stateCount: number[]): boolean {
  return isFoundPattern(stateCount, 1.333);
}

function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[4] - stateCount[3] - stateCount[2] / 2.0;
}

function distance(pattern1: FinderPattern, pattern2: FinderPattern): number {
  return Math.sqrt(Math.pow(pattern1.x - pattern2.x, 2) + Math.pow(pattern1.y - pattern2.y, 2));
}

function crossProductZ(pattern1: FinderPattern, pattern2: FinderPattern, pattern3: FinderPattern): number {
  const { x, y } = pattern2;

  return (pattern3.x - x) * (pattern1.y - y) - (pattern3.y - y) * (pattern1.x - x);
}

function orderBestPatterns(patterns: FinderPattern[]): void {
  let pattern1: FinderPattern;
  let pattern2: FinderPattern;
  let pattern3: FinderPattern;

  // Find distances between pattern centers
  const zeroOneDistance = distance(patterns[0], patterns[1]);
  const oneTwoDistance = distance(patterns[1], patterns[2]);
  const zeroTwoDistance = distance(patterns[0], patterns[2]);

  // Assume one closest to other two is B; A and C will just be guesses at first
  if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
    [pattern2, pattern1, pattern3] = patterns;
  } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
    [pattern1, pattern2, pattern3] = patterns;
  } else {
    [pattern1, pattern3, pattern2] = patterns;
  }

  // Use cross product to figure out whether A and C are correct or flipped.
  // This asks whether BC x BA has a positive z component, which is the arrangement
  // we want for A, B, C. If it's negative, then we've got it flipped around and
  // should swap A and C.
  if (crossProductZ(pattern1, pattern2, pattern3) < 0) {
    [pattern1, pattern3] = [pattern3, pattern1];
  }

  patterns[0] = pattern1;
  patterns[1] = pattern2;
  patterns[2] = pattern3;
}

export class FinderPatternFinder {
  #matrix: BitMatrix;
  #patterns: FinderPattern[] = [];

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number, originalStateCountTotal: number): number {
    let offsetY = y;

    const matrix = this.#matrix;
    const { height } = matrix;
    const stateCount = [0, 0, 0, 0, 0];

    // Start counting up from center
    while (offsetY >= 0 && matrix.get(x, offsetY)) {
      offsetY--;
      stateCount[2]++;
    }

    if (offsetY < 0) {
      return NaN;
    }

    while (offsetY >= 0 && !matrix.get(x, offsetY) && stateCount[1] <= maxCount) {
      offsetY--;
      stateCount[1]++;
    }

    // If already too many modules in this state or ran off the edge:
    if (offsetY < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offsetY >= 0 && matrix.get(x, offsetY) && stateCount[0] <= maxCount) {
      offsetY--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    offsetY = y + 1;

    while (offsetY < height && matrix.get(x, offsetY)) {
      offsetY++;
      stateCount[2]++;
    }

    if (offsetY === height) {
      return NaN;
    }

    while (offsetY < height && !matrix.get(x, offsetY) && stateCount[3] < maxCount) {
      offsetY++;
      stateCount[3]++;
    }

    if (offsetY === height || stateCount[3] >= maxCount) {
      return NaN;
    }

    while (offsetY < height && matrix.get(x, offsetY) && stateCount[4] < maxCount) {
      offsetY++;
      stateCount[4]++;
    }

    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is more than 40% different than
    // the original, assume it's a false positive
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }

    return isFoundPatternCross(stateCount) ? centerFromEnd(stateCount, offsetY) : NaN;
  }

  #crossCheckHorizontal(x: number, y: number, maxCount: number, originalStateCountTotal: number): number {
    let offsetX = x;

    const matrix = this.#matrix;
    const { width } = matrix;
    const stateCount = [0, 0, 0, 0, 0];

    while (offsetX >= 0 && matrix.get(offsetX, y)) {
      offsetX--;
      stateCount[2]++;
    }

    if (offsetX < 0) {
      return NaN;
    }

    while (offsetX >= 0 && !matrix.get(offsetX, y) && stateCount[1] <= maxCount) {
      offsetX--;
      stateCount[1]++;
    }

    if (offsetX < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offsetX >= 0 && matrix.get(offsetX, y) && stateCount[0] <= maxCount) {
      offsetX--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    offsetX = x + 1;

    while (offsetX < width && matrix.get(offsetX, y)) {
      offsetX++;
      stateCount[2]++;
    }

    if (offsetX === width) {
      return NaN;
    }

    while (offsetX < width && !matrix.get(offsetX, y) && stateCount[3] < maxCount) {
      offsetX++;
      stateCount[3]++;
    }

    if (offsetX === width || stateCount[3] >= maxCount) {
      return NaN;
    }

    while (offsetX < width && matrix.get(offsetX, y) && stateCount[4] < maxCount) {
      offsetX++;
      stateCount[4]++;
    }

    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is significantly different than
    // the original, assume it's a false positive
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
      return NaN;
    }

    return isFoundPatternCross(stateCount) ? centerFromEnd(stateCount, y) : NaN;
  }

  #crossCheckDiagonal(x: number, y: number): boolean {
    let offset = 0;

    const matrix = this.#matrix;
    const stateCount = [0, 0, 0, 0, 0];

    // Start counting up, left from center finding black center mass
    while (x >= offset && y >= offset && matrix.get(x - offset, y - offset)) {
      offset++;
      stateCount[2]++;
    }

    if (stateCount[2] === 0) {
      return false;
    }

    // Continue up, left finding white space
    while (x >= offset && y >= offset && !matrix.get(x - offset, y - offset)) {
      offset++;
      stateCount[1]++;
    }

    if (stateCount[1] === 0) {
      return false;
    }

    // Continue up, left finding black border
    while (x >= offset && y >= offset && matrix.get(x - offset, y - offset)) {
      offset++;
      stateCount[0]++;
    }

    if (stateCount[0] === 0) {
      return false;
    }

    offset = 1;

    const { width, height } = matrix;

    while (x + offset < width && y + offset < height && matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[2]++;
    }

    while (x + offset < width && y + offset < height && !matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[3]++;
    }

    if (stateCount[3] == 0) {
      return false;
    }

    while (x + offset < width && y + offset < height && matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[4]++;
    }

    if (stateCount[4] == 0) {
      return false;
    }

    return isFoundPatternDiagonal(stateCount);
  }

  #handlePossibleCenter(x: number, y: number, stateCount: number[]): boolean {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossCheckVertical(x, offsetX, stateCount[2], stateCountTotal);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(x, y, stateCount[2], stateCountTotal);

      if (!Number.isNaN(offsetX) && this.#crossCheckDiagonal(offsetX, offsetY)) {
        let found = false;

        const patterns = this.#patterns;
        const { length } = patterns;
        const moduleSize = stateCountTotal / 7;

        for (let i = 0; i < length; i++) {
          const pattern = patterns[i];

          // Look for about the same center and module size:
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            found = true;
            patterns[i] = pattern.combine(offsetX, offsetY, moduleSize);
            break;
          }
        }

        if (!found) {
          patterns.push(new FinderPattern(offsetX, offsetY, moduleSize));
        }

        return true;
      }
    }

    return false;
  }

  #selectBestPatterns(): FinderPattern[][] {
    const patterns = this.#patterns.filter(pattern => pattern.count >= 2);
    const { length } = patterns;

    // Couldn't find enough finder patterns
    if (length < 3) {
      throw new Error('');
    }

    // Begin HE modifications to safely detect multiple codes of equal size
    if (length === 3) {
      return [patterns];
    }

    patterns.sort((pattern1, pattern2) => {
      const value = pattern2.moduleSize - pattern1.moduleSize;

      return value < 0.0 ? -1 : value > 0.0 ? 1 : 0;
    });

    const results: FinderPattern[][] = [];

    return results;
  }
}
