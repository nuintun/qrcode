/**
 * @module detector
 */

import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { round, toInt32 } from '/common/utils';
import { distance, Point } from '/common/Point';
import { GridSampler } from '/common/GridSampler';
import { FinderPatternMatcher } from '../FinderPatternMatcher';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';
import { AlignmentPatternMatcher } from '../AlignmentPatternMatcher';
import { fromVersionSize, MAX_VERSION_SIZE, MIN_VERSION_SIZE } from '/common/Version';
import { PerspectiveTransform, quadrilateralToQuadrilateral } from '/common/PerspectiveTransform';

export interface DetectResult {
  readonly matrix: BitMatrix;
  readonly alignment?: Pattern;
  readonly finder: FinderPatternGroup;
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

function calculateModuleSizeOneWay(matrix: BitMatrix, pattern1: Pattern, pattern2: Pattern): number {
  const point1 = new Point(toInt32(pattern1.x), toInt32(pattern1.y));
  const point2 = new Point(toInt32(pattern2.x), toInt32(pattern2.y));
  const expectModuleSize1 = sizeOfBlackWhiteBlackRunBothWays(matrix, point1, point2);
  const expectModuleSize2 = sizeOfBlackWhiteBlackRunBothWays(matrix, point2, point1);

  if (Number.isNaN(expectModuleSize1)) {
    return expectModuleSize2 / 7;
  }

  if (Number.isNaN(expectModuleSize2)) {
    return expectModuleSize1 / 7;
  }

  // Average them, and divide by 7 since we've counted the width of 3 black modules,
  // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
  return (expectModuleSize1 + expectModuleSize2) / 14;
}

export function calculateModuleSize(matrix: BitMatrix, { topLeft, topRight, bottomLeft }: FinderPatternGroup): number {
  // Take the average
  return (calculateModuleSizeOneWay(matrix, topLeft, topRight) + calculateModuleSizeOneWay(matrix, topLeft, bottomLeft)) / 2;
}

export function calculateSymbolSize({ topLeft, topRight, bottomLeft }: FinderPatternGroup, moduleSize: number): number {
  const width = distance(topLeft, topRight);
  const height = distance(topLeft, bottomLeft);
  const size = round((width + height) / moduleSize / 2) + 7;

  // mod 4
  switch (size & 0x03) {
    case 0:
      return size + 1;
    case 2:
      return size - 1;
    case 3:
      if (size + 2 <= MAX_VERSION_SIZE) {
        return size + 2;
      }

      if (size - 2 >= MIN_VERSION_SIZE) {
        return size - 2;
      }

      return NaN;
  }

  return size;
}

function createTransform(
  size: number,
  { topLeft, topRight, bottomLeft }: FinderPatternGroup,
  alignmentPattern?: Pattern
): PerspectiveTransform {
  let bottomRightX;
  let bottomRightY;
  let sourceBottomRightX;
  let sourceBottomRightY;

  const sizeMinusThree = size - 3.5;
  const { x: topLeftX, y: topLeftY } = topLeft;
  const { x: topRightX, y: topRightY } = topRight;
  const { x: bottomLeftX, y: bottomLeftY } = bottomLeft;

  if (alignmentPattern != null) {
    bottomRightX = alignmentPattern.x;
    bottomRightY = alignmentPattern.y;
    sourceBottomRightX = sizeMinusThree - 3;
    sourceBottomRightY = sourceBottomRightX;
  } else {
    // Don't have an alignment pattern, just make up the bottom-right point
    bottomRightX = topRightX + bottomLeftX - topLeftX;
    bottomRightY = topRightY + bottomLeftY - topLeftY;
    sourceBottomRightX = sizeMinusThree;
    sourceBottomRightY = sizeMinusThree;
  }

  return quadrilateralToQuadrilateral(
    3.5,
    3.5,
    sizeMinusThree,
    3.5,
    sourceBottomRightX,
    sourceBottomRightY,
    3.5,
    sizeMinusThree,
    topLeftX,
    topLeftY,
    topRightX,
    topRightY,
    bottomRightX,
    bottomRightY,
    bottomLeftX,
    bottomLeftY
  );
}

export function detect(
  matrix: BitMatrix,
  finderMatcher: FinderPatternMatcher,
  alignmentMatcher: AlignmentPatternMatcher
): DetectResult[] {
  const detected: DetectResult[] = [];
  const finderPatternGroups = finderMatcher.groups();

  for (const finderPatternGroup of finderPatternGroups) {
    const moduleSize = calculateModuleSize(matrix, finderPatternGroup);

    if (moduleSize >= 1) {
      const sampler = new GridSampler(matrix);
      const size = calculateSymbolSize(finderPatternGroup, moduleSize);

      if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
        const version = fromVersionSize(size);

        // Find alignment
        if (version.alignmentPatterns.length > 0) {
          // Kind of arbitrary -- expand search radius before giving up
          // If we didn't find alignment pattern... well try anyway without it
          const alignmentPatterns = alignmentMatcher.filter(finderPatternGroup, size, moduleSize);

          // Founded alignment
          for (const alignmentPattern of alignmentPatterns) {
            detected.push({
              finder: finderPatternGroup,
              alignment: alignmentPattern,
              matrix: sampler.sampleGrid(size, size, createTransform(size, finderPatternGroup, alignmentPattern))
            });
          }
        }

        // No alignment version and fallback
        detected.push({
          finder: finderPatternGroup,
          matrix: sampler.sampleGrid(size, size, createTransform(size, finderPatternGroup))
        });
      }
    }
  }

  return detected;
}
