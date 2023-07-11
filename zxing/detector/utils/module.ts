/**
 * @module module
 */

import { toInt32 } from '/common/utils';
import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { distance, Point } from '/common/Point';

export type ModuleSizeGroup = [x: number, y: number];

export function calculateModuleSize(moduleSize: ModuleSizeGroup): number {
  return (moduleSize[0] + moduleSize[1]) / 2;
}

function sizeOfBlackWhiteBlackRun(matrix: BitMatrix, from: Point, to: Point): number {
  const line = new PlotLine(from, to);
  const points = line.points();

  // In black pixels, looking for white, first or second time.
  let state = 0;

  for (const [x, y] of points) {
    // Does current pixel mean we have moved white to black or vice versa?
    // Scanning black in state 0,2 and white in state 1, so if we find the wrong
    // color, advance to next state or end if we are in state 2 already
    if ((state === 1) === (matrix.get(x, y) === 1)) {
      if (state === 2) {
        return distance(new Point(x, y), from);
      }

      state++;
    }
  }

  to = line.to;
  from = line.from;

  const [deltaX] = line.delta;

  // Found black-white-black; give the benefit of the doubt that the next pixel outside the image
  // is "white" so this last point at (toX+xStep,toY) is the right ending. This is really a
  // small approximation; (toX+xStep,toY+yStep) might be really correct. Ignore this.
  if (state === 2) {
    return distance(new Point(to.x + deltaX, to.y), from);
  }

  return NaN;
}

function sizeOfBlackWhiteBlackRunBothWays(matrix: BitMatrix, from: Point, to: Point): number {
  // Now count other way -- don't run off image though of course
  const { x: toX, y: toY } = to;
  const { width, height } = matrix;
  const { x: fromX, y: fromY } = from;

  let scale = 1;
  let otherToX = fromX - (toX - fromX);
  let size = sizeOfBlackWhiteBlackRun(matrix, from, to);

  if (Number.isNaN(size)) {
    return NaN;
  }

  if (otherToX < 0) {
    scale = fromX / (fromX - otherToX);
    otherToX = 0;
  } else if (otherToX >= width) {
    scale = (width - 1 - fromX) / (otherToX - fromX);
    otherToX = width - 1;
  }

  let otherToY = toInt32(fromY - (toY - fromY) * scale);

  scale = 1;

  if (otherToY < 0) {
    scale = fromY / (fromY - otherToY);
    otherToY = 0;
  } else if (otherToY >= height) {
    scale = (height - 1 - fromY) / (otherToY - fromY);
    otherToY = height - 1;
  }

  otherToX = toInt32(fromX + (otherToX - fromX) * scale);

  // Middle pixel is double-counted this way; subtract 1
  size += sizeOfBlackWhiteBlackRun(matrix, from, new Point(otherToX, otherToY));

  return size - 1;
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
