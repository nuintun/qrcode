/**
 * @module FinderPatternFinder
 */

import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from './FinderPatternGroup';

const DIFF_EDGE_RATIO = 0.25;
const DIFF_MODULE_SIZE_RATIO = 0.25;
const MIN_MODULE_COUNT_PER_EDGE = 11;
const MAX_MODULE_COUNT_PER_EDGE = 175;

function isFoundPattern(stateCount: number[]): boolean {
  let stateCountTotal = 0;

  for (const count of stateCount) {
    if (count === 0) {
      return false;
    }

    stateCountTotal += count;
  }

  if (stateCountTotal < 7) {
    return false;
  }

  const moduleSize = stateCountTotal / 7;
  const moduleSizeDiff = moduleSize * 0.5;

  // Allow less than 50% variance from 1-1-3-1-1 proportions
  return (
    Math.abs(stateCount[0] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[1] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[2] - moduleSize * 3) < moduleSizeDiff * 3 &&
    Math.abs(stateCount[3] - moduleSize) < moduleSizeDiff &&
    Math.abs(stateCount[4] - moduleSize) < moduleSizeDiff
  );
}

function isEqualsEdge(edge1: number, edge2: number): boolean {
  const edgeAvg = (edge1 + edge2) / 2;
  const ratio = Math.abs(edge1 - edge2) / edgeAvg;

  return ratio < DIFF_EDGE_RATIO;
}

function isEqualsModuleSize(moduleSize1: number, moduleSize2: number): boolean {
  const modeSizeAvg = (moduleSize1 + moduleSize2) / 2;
  const ratio = (moduleSize1 - moduleSize2) / modeSizeAvg;

  return ratio <= DIFF_MODULE_SIZE_RATIO;
}

function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[4] - stateCount[3] - stateCount[2] / 2;
}

function pushStateCount(stateCount: number[], count: number): void {
  stateCount[0] = stateCount[1];
  stateCount[1] = stateCount[2];
  stateCount[2] = stateCount[3];
  stateCount[3] = stateCount[4];
  stateCount[4] = count;
}

function getStateCountTotal(stateCount: number[]): number {
  return stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
}

export class FinderPatternFinder {
  #matrix: BitMatrix;

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #crossCheckHorizontal(x: number, y: number, maxCount: number): number {
    let offsetX = x;

    const matrix = this.#matrix;
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

    const { width } = matrix;

    while (offsetX < width && matrix.get(offsetX, y)) {
      offsetX++;
      stateCount[2]++;
    }

    if (offsetX >= width) {
      return NaN;
    }

    while (offsetX < width && !matrix.get(offsetX, y) && stateCount[3] < maxCount) {
      offsetX++;
      stateCount[3]++;
    }

    if (offsetX >= width || stateCount[3] >= maxCount) {
      return NaN;
    }

    while (offsetX < width && matrix.get(offsetX, y) && stateCount[4] < maxCount) {
      offsetX++;
      stateCount[4]++;
    }

    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    return isFoundPattern(stateCount) ? centerFromEnd(stateCount, offsetX) : NaN;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number): number {
    let offsetY = y;

    const matrix = this.#matrix;
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

    const { height } = matrix;

    while (offsetY < height && matrix.get(x, offsetY)) {
      offsetY++;
      stateCount[2]++;
    }

    if (offsetY >= height) {
      return NaN;
    }

    while (offsetY < height && !matrix.get(x, offsetY) && stateCount[3] < maxCount) {
      offsetY++;
      stateCount[3]++;
    }

    if (offsetY >= height || stateCount[3] >= maxCount) {
      return NaN;
    }

    while (offsetY < height && matrix.get(x, offsetY) && stateCount[4] < maxCount) {
      offsetY++;
      stateCount[4]++;
    }

    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    return isFoundPattern(stateCount) ? centerFromEnd(stateCount, offsetY) : NaN;
  }

  #isFoundDiagonalPattern(x: number, y: number): boolean {
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

    if (stateCount[3] === 0) {
      return false;
    }

    while (x + offset < width && y + offset < height && matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[4]++;
    }

    if (stateCount[4] === 0) {
      return false;
    }

    return isFoundPattern(stateCount);
  }

  #add(patterns: Pattern[], x: number, y: number, stateCount: number[]): void {
    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossCheckVertical(toInt32(offsetX), y, stateCount[2]);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(toInt32(offsetX), toInt32(offsetY), stateCount[2]);

      if (!Number.isNaN(offsetX) && this.#isFoundDiagonalPattern(toInt32(offsetX), toInt32(offsetY))) {
        let found = false;

        const { length } = patterns;
        const moduleSize = getStateCountTotal(stateCount) / 7;

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
          patterns.push(new Pattern(offsetX, offsetY, moduleSize));
        }
      }
    }
  }

  #selectBestPatterns(patterns: Pattern[]): FinderPatternGroup[] {
    const { length } = patterns;

    // Couldn't find enough finder patterns
    if (length < 3) {
      return [];
    }

    // Max i1
    const maxI1 = length - 2;
    // Max i2
    const maxI2 = length - 1;
    // Groups
    const finderPatternGroups: FinderPatternGroup[] = [];

    // Sort patterns
    patterns.sort((pattern1, pattern2) => pattern2.moduleSize - pattern1.moduleSize);

    for (let i1 = 0; i1 < maxI1; i1++) {
      const pattern1 = patterns[i1];
      const moduleSize1 = pattern1.moduleSize;

      for (let i2 = i1 + 1; i2 < maxI2; i2++) {
        const pattern2 = patterns[i2];
        const moduleSize2 = pattern2.moduleSize;

        if (!isEqualsModuleSize(moduleSize1, moduleSize2)) {
          break;
        }

        for (let i3 = i2 + 1; i3 < length; i3++) {
          const pattern3 = patterns[i3];

          if (!isEqualsModuleSize(moduleSize2, pattern3.moduleSize)) {
            break;
          }

          const finderPatternGroup = new FinderPatternGroup([pattern1, pattern2, pattern3]);
          const { topLeft, topRight, bottomLeft } = finderPatternGroup;
          const a = distance(topLeft, bottomLeft);
          const b = distance(topLeft, topRight);

          // Calculate the difference of the cathetus lengths in percent
          if (!isEqualsEdge(a, b)) {
            continue;
          }

          const c = distance(topRight, bottomLeft);

          // Calculate the difference of the hypotenuse lengths in percent
          if (!isEqualsEdge(Math.sqrt(a * a + b * b), c)) {
            continue;
          }

          // Check the sizes
          const moduleCount = (a + b) / (topLeft.moduleSize + topRight.moduleSize);

          if (moduleCount < MIN_MODULE_COUNT_PER_EDGE || moduleCount > MAX_MODULE_COUNT_PER_EDGE) {
            continue;
          }

          // All tests passed!
          finderPatternGroups.push(finderPatternGroup);
        }
      }
    }

    return finderPatternGroups;
  }

  public find(): FinderPatternGroup[] {
    const matrix = this.#matrix;
    const patterns: Pattern[] = [];
    const { width, height } = matrix;

    for (let y = 0; y < height; y++) {
      let count = 0;
      let lastBit = matrix.get(0, y);

      const stateCount = [0, 0, 0, 0, 0];

      const checkAndAdd = (x: number, y: number) => {
        pushStateCount(stateCount, count);

        if (isFoundPattern(stateCount)) {
          this.#add(patterns, x, y, stateCount);
        }
      };

      for (let x = 0; x < width; x++) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          checkAndAdd(x, y);

          count = 1;
          lastBit = bit;
        }
      }

      checkAndAdd(width - 1, y);
    }

    return this.#selectBestPatterns(patterns);
  }
}
