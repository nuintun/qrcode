/**
 * @module matcher
 */

import { toInt32 } from '/common/utils';
import { distance } from '/common/Point';
import { Pattern } from '/detector/Pattern';
import { BitMatrix } from '/common/BitMatrix';

export const DIFF_EDGE_RATIO = 0.5;
export const DIFF_MODULE_SIZE_RATIO = 1;
export const MIN_MODULE_COUNT_PER_EDGE = 11;
export const DIFF_FINDER_PATTERN_RATIO = 0.5;
export const MAX_MODULE_COUNT_PER_EDGE = 175;
export const DIFF_ALIGNMENT_PATTERN_RATIO = 0.8;

export function centerFromEnd(countState: number[], end: number): number {
  const { length } = countState;
  const middleIndex = toInt32(length / 2);

  let center = end - countState[middleIndex] / 2;

  for (let i = middleIndex + 1; i < length; i++) {
    center -= countState[i];
  }

  return center;
}

export function setCountState(countState: number[], count: number): void {
  const { length } = countState;
  const lastIndex = length - 1;

  for (let i = 0; i < lastIndex; i++) {
    countState[i] = countState[i + 1];
  }

  countState[lastIndex] = count;
}

export function getCountStateTotal(countState: number[], checkZero?: boolean): number {
  let countStateTotal = 0;

  for (const count of countState) {
    if (checkZero && count === 0) {
      return NaN;
    }

    countStateTotal += count;
  }

  return countStateTotal;
}

export function isMatchFinderPattern(countState: number[]): boolean {
  const moduleCount = 7;
  const { length } = countState;
  const countStateTotal = getCountStateTotal(countState, true);

  if (countStateTotal >= moduleCount) {
    const moduleSize = countStateTotal / moduleCount;

    if (moduleSize >= 1) {
      const middleIndex = toInt32(length / 2);
      const threshold = moduleSize * DIFF_FINDER_PATTERN_RATIO;

      // Allow less than DIFF_FINDER_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
      for (let i = 0; i < length; i++) {
        const size = countState[i];
        const ratio = i !== middleIndex ? 1 : 3;
        const moduleSizeDiff = Math.abs(size - moduleSize * ratio);

        if (moduleSizeDiff > 1 && moduleSizeDiff > threshold * ratio) {
          return false;
        }
      }

      return true;
    }
  }

  return false;
}

export function isMatchAlignmentPattern(countState: number[]): boolean {
  const moduleCount = countState.length;
  const countStateTotal = getCountStateTotal(countState, true);

  if (countStateTotal >= moduleCount) {
    const moduleSize = countStateTotal / moduleCount;

    if (moduleSize >= 1) {
      const threshold = moduleSize * DIFF_ALIGNMENT_PATTERN_RATIO;

      // Allow less than DIFF_ALIGNMENT_MODULE_SIZE_RATIO variance from 1-1-1 or 1-1-1-1-1 proportions
      for (const size of countState) {
        const moduleSizeDiff = Math.abs(size - moduleSize);

        if (moduleSizeDiff > 1 && moduleSizeDiff > threshold) {
          return false;
        }
      }

      return true;
    }
  }

  return false;
}

export function isEqualsEdge(edge1: number, edge2: number): boolean {
  const edgeAvg = (edge1 + edge2) / 2;
  const ratio = Math.abs(edge1 - edge2) / edgeAvg;

  return ratio < DIFF_EDGE_RATIO;
}

export function isEqualsModuleSize(moduleSize1: number, moduleSize2: number): boolean {
  const moduleSize = (moduleSize1 + moduleSize2) / 2;
  const moduleSizeDiff = moduleSize * DIFF_MODULE_SIZE_RATIO;

  return Math.abs(moduleSize1 - moduleSize2) <= moduleSizeDiff;
}

export function isValidModuleCount(edge: number, moduleSize: number): boolean {
  // Check the sizes
  const moduleCount = Math.ceil(edge / moduleSize);

  return moduleCount >= MIN_MODULE_COUNT_PER_EDGE && moduleCount <= MAX_MODULE_COUNT_PER_EDGE;
}

export function alignCrossPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  checker: (countState: number[]) => boolean,
  isVertical?: boolean
): [offset: number, countState: number[]] {
  let offset = isVertical ? y : x;

  const countState = [0, 0, 0, 0, 0];
  const size = isVertical ? matrix.height : matrix.width;
  const isBlackPixel = (): number => {
    return isVertical ? matrix.get(x, offset) : matrix.get(offset, y);
  };

  while (offset >= 0 && isBlackPixel()) {
    offset--;
    countState[2]++;
  }

  while (offset >= 0 && !isBlackPixel()) {
    offset--;
    countState[1]++;
  }

  while (offset >= 0 && countState[0] < overscan && isBlackPixel()) {
    offset--;
    countState[0]++;
  }

  offset = (isVertical ? y : x) + 1;

  while (offset < size && isBlackPixel()) {
    offset++;
    countState[2]++;
  }

  while (offset < size && !isBlackPixel()) {
    offset++;
    countState[3]++;
  }

  while (offset < size && countState[4] < overscan && isBlackPixel()) {
    offset++;
    countState[4]++;
  }

  return [checker(countState) ? centerFromEnd(countState, offset) : NaN, countState];
}

export function checkDiagonalPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  checker: (countState: number[]) => boolean,
  isBackslash?: boolean
): boolean {
  let step = -1;
  let offsetX = x;
  let offsetY = y;

  const { width, height } = matrix;
  const countState = [0, 0, 0, 0, 0];
  const slope = isBackslash ? -1 : 1;
  const updateAxis = (): void => {
    offsetX += step;
    offsetY -= step * slope;
  };
  const isBlackPixel = (): number => {
    return matrix.get(offsetX, offsetY);
  };

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && isBlackPixel()) {
    updateAxis();

    countState[2]++;
  }

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
    updateAxis();

    countState[1]++;
  }

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && countState[0] < overscan && isBlackPixel()) {
    updateAxis();

    countState[0]++;
  }

  step = 1;
  offsetX = x + step;
  offsetY = y - step * slope;

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && isBlackPixel()) {
    updateAxis();

    countState[2]++;
  }

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
    updateAxis();

    countState[3]++;
  }

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && countState[4] < overscan && isBlackPixel()) {
    updateAxis();

    countState[4]++;
  }

  return checker(countState);
}

function crossProductZ(pattern1: Pattern, pattern2: Pattern, pattern3: Pattern): number {
  const { x, y } = pattern2;

  return (pattern3.x - x) * (pattern1.y - y) - (pattern3.y - y) * (pattern1.x - x);
}

export function orderFinderPatterns(patterns: Pattern[]): [topLeft: Pattern, topRight: Pattern, bottomLeft: Pattern] {
  let topLeft: Pattern;
  let topRight: Pattern;
  let bottomLeft: Pattern;

  // Find distances between pattern centers
  const [pattern1, pattern2, pattern3] = patterns;
  const oneTwoDistance = distance(pattern1, pattern2);
  const twoThreeDistance = distance(pattern2, pattern3);
  const oneThreeDistance = distance(pattern1, pattern3);

  // Assume one closest to other two is B; A and C will just be guesses at first
  if (twoThreeDistance >= oneTwoDistance && twoThreeDistance >= oneThreeDistance) {
    [topLeft, bottomLeft, topRight] = patterns;
  } else if (oneThreeDistance >= twoThreeDistance && oneThreeDistance >= oneTwoDistance) {
    [bottomLeft, topLeft, topRight] = patterns;
  } else {
    [bottomLeft, topRight, topLeft] = patterns;
  }

  // Use cross product to figure out whether A and C are correct or flipped.
  // This asks whether BC x BA has a positive z component, which is the arrangement
  // we want for A, B, C. If it's negative, then we've got it flipped around and
  // should swap A and C.
  if (crossProductZ(bottomLeft, topLeft, topRight) < 0) {
    [bottomLeft, topRight] = [topRight, bottomLeft];
  }

  return [topLeft, topRight, bottomLeft];
}
