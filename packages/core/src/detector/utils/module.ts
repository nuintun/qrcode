/**
 * @module module
 */

import { toInt32 } from '/common/utils';
import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { distance, Point } from '/common/Point';

export type ModuleSizeGroup = readonly [x: number, y: number];

function sizeOfBlackWhiteBlackRun(matrix: BitMatrix, from: Point, to: Point): number {
  // In black pixels, looking for white, first or second time.
  let state = 0;

  const { width, height } = matrix;
  const centerX = (from.x + to.x) / 2;
  const centerY = (from.y + to.y) / 2;
  // Center point is already enough
  const center = new Point(centerX, centerY);
  const points = new PlotLine(from, center).points();

  for (const [x, y] of points) {
    // Now count other way -- don't run off image though of course
    if (x < 0 || y < 0 || x >= width || y >= height) {
      if (state === 2) {
        return distance(from, new Point(x, y));
      }

      return NaN;
    }

    // Does current pixel mean we have moved white to black or vice versa?
    // Scanning black in state 0,2 and white in state 1, so if we find the wrong
    // color, advance to next state or end if we are in state 2 already
    if ((state === 1) === (matrix.get(x, y) === 1)) {
      if (state === 2) {
        return distance(from, new Point(x, y));
      }

      state++;
    }
  }

  return NaN;
}

function sizeOfBlackWhiteBlackRunBothWays(matrix: BitMatrix, from: Point, to: Point): number {
  const size1 = sizeOfBlackWhiteBlackRun(matrix, from, to);

  if (Number.isNaN(size1)) {
    return NaN;
  }

  const { x: toX, y: toY } = to;
  const { x: fromX, y: fromY } = from;
  const otherToX = fromX - (toX - fromX);
  const otherToY = fromY - (toY - fromY);
  const size2 = sizeOfBlackWhiteBlackRun(matrix, from, new Point(otherToX, otherToY));

  if (Number.isNaN(size2)) {
    return NaN;
  }

  // Middle pixel is double-counted this way; subtract 1
  return size1 + size2 - 1;
}

export function calculateModuleSizeOneWay(matrix: BitMatrix, pattern1: Pattern, pattern2: Pattern): number {
  const point1 = new Point(toInt32(pattern1.x), toInt32(pattern1.y));
  const point2 = new Point(toInt32(pattern2.x), toInt32(pattern2.y));
  const moduleSize1 = sizeOfBlackWhiteBlackRunBothWays(matrix, point1, point2);
  const moduleSize2 = sizeOfBlackWhiteBlackRunBothWays(matrix, point2, point1);

  if (Number.isNaN(moduleSize1)) {
    return moduleSize2 / 7;
  }

  if (Number.isNaN(moduleSize2)) {
    return moduleSize1 / 7;
  }

  // Average them, and divide by 7 since we've counted the width of 3 black modules,
  // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
  return (moduleSize1 + moduleSize2) / 14;
}
