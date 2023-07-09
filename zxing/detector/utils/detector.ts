/**
 * @module detector
 */

import { round } from '/common/utils';
import { distance } from '/common/Point';
import { Pattern } from '/detector/Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { GridSampler } from '/common/GridSampler';
import { calculateModuleSizeOneWay } from './pattern';
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
