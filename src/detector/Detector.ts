/**
 * @module Detector
 */

import { Detect } from './Detect';
import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { fromVersionSize } from '/common/Version';
import { createTransform } from './utils/transform';
import { calculateModuleSize } from './utils/module';
import { FinderPatternGroup } from './FinderPatternGroup';
import { FinderPatternFinder } from './FinderPatternFinder';
import { ALIGNMENT_PATTERN_RATIOS } from './utils/constants';
import { checkModulesInMappingTimingLine } from './utils/timing';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';

export interface Options {
  strict?: boolean;
}

function getExpectAlignment({
  size,
  topLeft,
  topRight,
  bottomLeft,
  moduleSize: [xModuleSize, yModuleSize]
}: FinderPatternGroup): Pattern {
  const { x, y } = topLeft;
  const correctionToTopLeft = 1 - 3 / (size - 7);
  const bottomRightX = topRight.x + bottomLeft.x - x;
  const bottomRightY = topRight.y + bottomLeft.y - y;
  const expectAlignmentX = x + correctionToTopLeft * (bottomRightX - x);
  const expectAlignmentY = y + correctionToTopLeft * (bottomRightY - y);

  return new Pattern(expectAlignmentX, expectAlignmentY, xModuleSize * 5, yModuleSize * 5, ALIGNMENT_PATTERN_RATIOS, 0);
}

function findAlignmentInRegion(matrix: BitMatrix, finderPatternGroup: FinderPatternGroup, strict?: boolean): Pattern[] {
  const { size, moduleSize } = finderPatternGroup;
  const allowance = Math.min(15, toInt32(size / 4));
  const moduleSizeAvg = calculateModuleSize(moduleSize);
  const expectAlignment = getExpectAlignment(finderPatternGroup);
  const alignmentFinder = new AlignmentPatternFinder(matrix, strict);
  const alignmentAreaAllowance = Math.ceil(moduleSizeAvg * allowance);
  const { x: expectAlignmentX, y: expectAlignmentY } = expectAlignment;
  const alignmentAreaTop = toInt32(Math.max(0, expectAlignmentY - alignmentAreaAllowance));
  const alignmentAreaLeft = toInt32(Math.max(0, expectAlignmentX - alignmentAreaAllowance));
  const alignmentAreaRight = toInt32(Math.min(matrix.width - 1, expectAlignmentX + alignmentAreaAllowance));
  const alignmentAreaBottom = toInt32(Math.min(matrix.height - 1, expectAlignmentY + alignmentAreaAllowance));

  alignmentFinder.find(
    alignmentAreaLeft,
    alignmentAreaTop,
    alignmentAreaRight - alignmentAreaLeft,
    alignmentAreaBottom - alignmentAreaTop
  );

  return alignmentFinder.filter(expectAlignment, moduleSizeAvg);
}

export class Detector {
  #options: Options;

  constructor(options: Options = {}) {
    this.#options = options;
  }

  public *detect(matrix: BitMatrix): Generator<Detect, void, boolean> {
    const { strict } = this.#options;
    const { width, height } = matrix;
    const finderFinder = new FinderPatternFinder(matrix, strict);

    finderFinder.find(0, 0, width, height);

    const finderPatternGroups = finderFinder.groups();

    let iterator = finderPatternGroups.next();

    while (!iterator.done) {
      let succeed = false;

      const finderPatternGroup = iterator.value;
      const { size } = finderPatternGroup;
      const version = fromVersionSize(size);

      // Find alignment
      if (version.alignmentPatterns.length > 0) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it
        const alignmentPatterns = findAlignmentInRegion(matrix, finderPatternGroup);

        // Founded alignment
        for (const alignmentPattern of alignmentPatterns) {
          const transform = createTransform(finderPatternGroup, alignmentPattern);

          if (
            checkModulesInMappingTimingLine(matrix, transform, size) ||
            checkModulesInMappingTimingLine(matrix, transform, size, true)
          ) {
            succeed = yield new Detect(matrix, transform, finderPatternGroup, alignmentPattern);

            // Succeed, skip next alignment pattern
            if (succeed) {
              break;
            }
          }
        }
      } else {
        const transform = createTransform(finderPatternGroup);

        if (
          checkModulesInMappingTimingLine(matrix, transform, size) ||
          checkModulesInMappingTimingLine(matrix, transform, size, true)
        ) {
          // No alignment pattern version
          succeed = yield new Detect(matrix, transform, finderPatternGroup);
        }
      }

      iterator = finderPatternGroups.next(succeed);
    }
  }
}
