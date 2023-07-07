/**
 * @module matcher
 */

import { Point } from '/common/Point';
import { toInt32 } from '/common/utils';
import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';

export const DIFF_EDGE_RATIO = 0.5;
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

export function isValidModuleCount(edge: number, moduleSize: number): boolean {
  // Check the sizes
  const moduleCount = Math.ceil(edge / moduleSize);

  return moduleCount >= MIN_MODULE_COUNT_PER_EDGE && moduleCount <= MAX_MODULE_COUNT_PER_EDGE;
}

export function isEqualsAlignmentModuleSize(moduleSize1: number, moduleSize2: number): boolean {
  return Math.abs(moduleSize1 - moduleSize2) <= (moduleSize1 + moduleSize2) / 2;
}

export function alignCrossPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  maxCount: number,
  isHorizontal: boolean,
  checker: (countState: number[]) => boolean
): [offset: number, countState: number[]] {
  let offset = isHorizontal ? x : y;

  const countState = [0, 0, 0, 0, 0];
  const isBlackPixel = (): number => {
    return isHorizontal ? matrix.get(offset, y) : matrix.get(x, offset);
  };

  while (offset >= 0 && isBlackPixel()) {
    offset--;
    countState[2]++;
  }

  while (offset >= 0 && !isBlackPixel()) {
    offset--;
    countState[1]++;
  }

  while (offset >= 0 && countState[0] < maxCount && isBlackPixel()) {
    offset--;
    countState[0]++;
  }

  offset = (isHorizontal ? x : y) + 1;

  const size = isHorizontal ? matrix.width : matrix.height;

  while (offset < size && isBlackPixel()) {
    offset++;
    countState[2]++;
  }

  while (offset < size && !isBlackPixel()) {
    offset++;
    countState[3]++;
  }

  while (offset < size && countState[4] < maxCount && isBlackPixel()) {
    offset++;
    countState[4]++;
  }

  return [checker(countState) ? centerFromEnd(countState, offset) : NaN, countState];
}

export function checkDiagonalPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  maxCount: number,
  isBackslash: boolean,
  checker: (countState: number[]) => boolean
): boolean {
  let offset = 0;

  const countState = [0, 0, 0, 0, 0];
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
    countState[2]++;
  }

  // Continue up, left finding white space
  while (x >= offset && y >= offset && !isBlackPixel(true)) {
    offset++;
    countState[1]++;
  }

  // Continue up, left finding black border
  while (x >= offset && y >= offset && countState[0] < maxCount && isBlackPixel(true)) {
    offset++;
    countState[0]++;
  }

  offset = 1;

  const { width, height } = matrix;

  while (x + offset < width && y + offset < height && isBlackPixel(false)) {
    offset++;
    countState[2]++;
  }

  while (x + offset < width && y + offset < height && !isBlackPixel(false)) {
    offset++;
    countState[3]++;
  }

  while (x + offset < width && y + offset < height && countState[4] < maxCount && isBlackPixel(false)) {
    offset++;
    countState[4]++;
  }

  return checker(countState);
}

export function checkRepeatPixelsInLine(matrix: BitMatrix, pattern1: Pattern, pattern2: Pattern): boolean {
  let black = 0;
  let white = 0;

  const points = new PlotLine(pattern1, pattern2).points();
  const moduleSize1 = (pattern1.width + pattern1.height) / 14;
  const moduleSize2 = (pattern2.width + pattern2.height) / 14;
  const maxRepeat = (moduleSize1 + moduleSize2) * 10;

  for (const [x, y] of points) {
    if (matrix.get(x, y)) {
      black++;
      white = 0;
    } else {
      white++;
      black = 0;
    }

    if (white > maxRepeat || black > maxRepeat) {
      return false;
    }
  }

  return true;
}

export type TimingPoints = [start: Point, end: Point];

function calculateTimingRatio(axis: number, control: number) {
  return control > axis ? 1 : control < axis ? -1 : 0;
}

function getTimingPointXAxis({ x, rect }: Pattern, ratio: number) {
  const [, right, , left] = rect;

  return ratio > 0 ? right : ratio < 0 ? left : x;
}

function getTimingPointYAxis({ y, rect }: Pattern, ratio: number) {
  const [top, , bottom] = rect;

  return ratio > 0 ? bottom : ratio < 0 ? top : y;
}

export function calculateTimingPoints(start: Pattern, end: Pattern, control: Pattern, isHorizontal?: boolean): TimingPoints {
  const { x: endX, y: endY } = end;
  const { x: startX, y: startY } = start;
  const controlX = control.x + end.x - startX;
  const controlY = control.y + end.y - startY;
  const xRatio = calculateTimingRatio(startX, controlX);
  const yRatio = calculateTimingRatio(startY, controlY);
  const endXTranslate = getTimingPointXAxis(end, xRatio);
  const endYTranslate = getTimingPointYAxis(end, yRatio);
  const startXTranslate = getTimingPointXAxis(start, xRatio);
  const startYTranslate = getTimingPointYAxis(start, yRatio);

  if (xRatio === 0 || yRatio === 0) {
    return [new Point(startXTranslate, startYTranslate), new Point(endXTranslate, endYTranslate)];
  }

  if (isHorizontal ? xRatio === yRatio : xRatio !== yRatio) {
    return [new Point(startX, startYTranslate), new Point(endX, endYTranslate)];
  }

  return [new Point(startXTranslate, startY), new Point(endXTranslate, endY)];
}

function isValidTimingLine(countState: number[]): boolean {
  if (countState.length >= 4) {
    countState = countState.slice(1, -1).sort((a, b) => b - a);

    return countState[0] / countState[countState.length - 1] <= 5;
  }

  return false;
}

export function checkPixelsInTimingLine(
  matrix: BitMatrix,
  { topLeft, topRight, bottomLeft }: FinderPatternGroup,
  isHorizontal?: boolean
) {
  const countState = [];
  const [start, end] = isHorizontal
    ? calculateTimingPoints(topLeft, topRight, bottomLeft, isHorizontal)
    : calculateTimingPoints(topLeft, bottomLeft, topRight);
  const points = new PlotLine(start, end).points();

  let count = 0;
  let lastBit = matrix.get(toInt32(start.x), toInt32(start.y));

  for (const [x, y] of points) {
    const bit = matrix.get(x, y);

    if (bit === lastBit) {
      count++;
    } else {
      countState.push(count);
      count = 1;
      lastBit = bit;
    }
  }

  return isValidTimingLine(countState);
}
