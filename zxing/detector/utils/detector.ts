/**
 * @module detector
 */

import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { round, toInt32 } from '/common/utils';
import { GridSampler } from '/common/GridSampler';
import { FinderPatternMatcher } from '../FinderPatternMatcher';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';
import { AlignmentPatternMatcher } from '../AlignmentPatternMatcher';
import { distance, isPointInQuadrangle, Point } from '/common/Point';
import { quadrilateralToQuadrilateral } from '/common/PerspectiveTransform';
import { fromVersionSize, MAX_VERSION_SIZE, MIN_VERSION_SIZE, Version } from '/common/Version';
import { isEqualsModuleSize } from './matcher';

export interface DetectResult {
  readonly matrix: BitMatrix;
  readonly alignment?: Pattern;
  readonly bottomRight: Pattern;
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

  const [deltaX, deltaY] = line.delta;

  // Found black-white-black; give the benefit of the doubt that the next pixel outside the image
  // is "white" so this last point at (toX+xStep,toY) is the right ending. This is really a
  // small approximation; (toX+xStep,toY+yStep) might be really correct. Ignore this.
  if (state === 2) {
    return distance(new Point(to.x + deltaX, to.y + deltaY), from);
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

  if (expectModuleSize1 > 0) {
    return expectModuleSize2 / 7;
  }

  if (expectModuleSize2 > 0) {
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

export function computeSymbolSize({ topLeft, topRight, bottomLeft }: FinderPatternGroup, moduleSize: number): number {
  const width = distance(topLeft, topRight) / moduleSize;
  const height = distance(topLeft, bottomLeft) / moduleSize;
  const size = round((width + height) / 2) + 7;

  // mod 4
  switch (size & 0x03) {
    case 0:
      return size + 1;
    case 2:
      return size - 1;
    case 3:
      return NaN;
  }

  return size;
}

function findAlignmentInRegion(
  matrix: BitMatrix,
  { topLeft, topRight, bottomLeft }: FinderPatternGroup,
  alignmentPatterns: Pattern[],
  version: Version,
  moduleSize: number
): Pattern | undefined {
  const { x, y } = topLeft;
  // Look for an alignment pattern (3 modules in size) around where it should be
  const allowance = Math.ceil(moduleSize * 5);
  const bottomRightX = topRight.x - x + bottomLeft.x;
  const bottomRightY = topRight.y - y + bottomLeft.y;
  const correctionToTopLeft = 1 - 3 / (version.size - 7);
  const expectAlignmentX = x + correctionToTopLeft * (bottomRightX - x);
  const expectAlignmentY = y + correctionToTopLeft * (bottomRightY - y);
  const alignmentAreaTopY = Math.max(0, expectAlignmentY - allowance);
  const alignmentAreaLeftX = Math.max(0, expectAlignmentX - allowance);
  const alignmentAreaRightX = Math.min(matrix.width - 1, expectAlignmentX + allowance);
  const alignmentAreaBottomY = Math.min(matrix.height - 1, expectAlignmentY + allowance);
  const alignmentAreaTopLeft = new Point(alignmentAreaLeftX, alignmentAreaTopY);
  const alignmentAreaTopRight = new Point(alignmentAreaRightX, alignmentAreaTopY);
  const alignmentAreaBottomRight = new Point(alignmentAreaRightX, alignmentAreaBottomY);
  const alignmentAreaBottomLeft = new Point(alignmentAreaLeftX, alignmentAreaBottomY);

  const patterns = alignmentPatterns.filter(pattern => {
    return (
      isEqualsModuleSize(pattern.moduleSize, moduleSize) &&
      isPointInQuadrangle(
        pattern,
        alignmentAreaTopLeft,
        alignmentAreaTopRight,
        alignmentAreaBottomRight,
        alignmentAreaBottomLeft
      )
    );
  });

  if (patterns.length > 1) {
    const expectAlignment = new Point(expectAlignmentX, expectAlignmentX);

    patterns.sort((pattern1, pattern2) => {
      return distance(pattern1, expectAlignment) - distance(pattern2, expectAlignment);
    });
  }

  return patterns[0];
}

export type Transform = (
  matrix: BitMatrix,
  size: number,
  finderPatternGroup: FinderPatternGroup,
  alignmentPattern?: Pattern
) => BitMatrix;

function transformImpl(
  matrix: BitMatrix,
  size: number,
  { topLeft, topRight, bottomLeft }: FinderPatternGroup,
  alignmentPattern?: Pattern
) {
  let bottomRightX;
  let bottomRightY;
  let sourceBottomRightX;
  let sourceBottomRightY;

  const dimMinusThree = size - 3.5;
  const sampler = new GridSampler(matrix);

  if (alignmentPattern != null) {
    bottomRightX = alignmentPattern.x;
    bottomRightY = alignmentPattern.y;
    sourceBottomRightX = dimMinusThree - 3;
    sourceBottomRightY = sourceBottomRightX;
  } else {
    // Don't have an alignment pattern, just make up the bottom-right point
    bottomRightX = topRight.x - topLeft.x + bottomLeft.x;
    bottomRightY = topRight.y - topLeft.y + bottomLeft.y;
    sourceBottomRightX = dimMinusThree;
    sourceBottomRightY = dimMinusThree;
  }

  return sampler.sampleGrid(
    size,
    size,
    quadrilateralToQuadrilateral(
      3.5,
      3.5,
      dimMinusThree,
      3.5,
      sourceBottomRightX,
      sourceBottomRightY,
      3.5,
      dimMinusThree,
      topLeft.x,
      topLeft.y,
      topRight.x,
      topRight.y,
      bottomRightX,
      bottomRightY,
      bottomLeft.x,
      bottomLeft.y
    )
  );
}

export function detect(
  matrix: BitMatrix,
  finderMatcher: FinderPatternMatcher,
  alignmentMatcher: AlignmentPatternMatcher,
  transform: Transform = transformImpl
): DetectResult[] {
  const result: DetectResult[] = [];
  const finderPatternGroups = finderMatcher.groups;
  const alignmentPatterns = alignmentMatcher.patterns;

  for (const finderPatternGroup of finderPatternGroups) {
    const moduleSize = calculateModuleSize(matrix, finderPatternGroup);

    if (moduleSize >= 1) {
      const size = computeSymbolSize(finderPatternGroup, moduleSize);

      if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
        const version = fromVersionSize(size);

        let alignmentPattern: Pattern | undefined;

        if (version.alignmentPatterns.length > 0) {
          // Kind of arbitrary -- expand search radius before giving up
          // If we didn't find alignment pattern... well try anyway without it
          alignmentPattern = findAlignmentInRegion(matrix, finderPatternGroup, alignmentPatterns, version, moduleSize);
        }

        // TODO 测试
        const { topLeft, topRight, bottomLeft } = finderPatternGroup;
        const bottomRight = new Pattern(
          topRight.x + bottomLeft.x - topLeft.x,
          topRight.y + bottomLeft.y - topLeft.y,
          topLeft.moduleSize
        );

        const bitMatrix = transform(matrix, size, finderPatternGroup, alignmentPattern);

        if (bitMatrix != null) {
          if (alignmentPattern) {
            result.push({
              bottomRight,
              matrix: bitMatrix,
              finder: finderPatternGroup,
              alignment: alignmentPattern
            });
          } else {
            result.push({
              bottomRight,
              matrix: bitMatrix,
              finder: finderPatternGroup
            });
          }
        }
      }
    }
  }

  return result;
}
