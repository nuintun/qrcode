/**
 * @module Detector
 */

import { Detect } from './Detect';
import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { fromVersionSize } from '/common/Version';
import { createTransform } from './utils/transform';
import { checkMappingTimingLine } from './utils/timing';
import { FinderPatternGroup } from './FinderPatternGroup';
import { ALIGNMENT_PATTERN_RATIOS } from './PatternRatios';
import { FinderPatternFinder } from './FinderPatternFinder';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';

export interface Options {
  strict?: boolean;
}

function getExpectAlignment(finderPatternGroup: FinderPatternGroup): Pattern {
  const { x, y } = finderPatternGroup.topLeft;
  const size = FinderPatternGroup.size(finderPatternGroup);
  const expectAlignmentCorrectionToTopLeftRatio = 1 - 3 / (size - 7);
  const bottomRight = FinderPatternGroup.bottomRight(finderPatternGroup);
  const [xModuleSize, yModuleSize] = FinderPatternGroup.moduleSizes(finderPatternGroup);
  const expectAlignmentX = x + (bottomRight.x - x) * expectAlignmentCorrectionToTopLeftRatio;
  const expectAlignmentY = y + (bottomRight.y - y) * expectAlignmentCorrectionToTopLeftRatio;

  return new Pattern(ALIGNMENT_PATTERN_RATIOS, expectAlignmentX, expectAlignmentY, xModuleSize * 5, yModuleSize * 5, 0);
}

function findAlignmentInRegion(matrix: BitMatrix, finderPatternGroup: FinderPatternGroup, strict?: boolean): Pattern[] {
  const size = FinderPatternGroup.size(finderPatternGroup);
  const scanAllowanceRatio = Math.min(20, toInt32(size / 4));
  const expectAlignment = getExpectAlignment(finderPatternGroup);
  const alignmentFinder = new AlignmentPatternFinder(matrix, strict);
  const moduleSize = FinderPatternGroup.moduleSize(finderPatternGroup);
  const { x: expectAlignmentX, y: expectAlignmentY } = expectAlignment;
  const alignmentAreaAllowanceSize = Math.ceil(moduleSize * scanAllowanceRatio);
  const alignmentAreaTop = toInt32(Math.max(0, expectAlignmentY - alignmentAreaAllowanceSize));
  const alignmentAreaLeft = toInt32(Math.max(0, expectAlignmentX - alignmentAreaAllowanceSize));
  const alignmentAreaRight = toInt32(Math.min(matrix.width - 1, expectAlignmentX + alignmentAreaAllowanceSize));
  const alignmentAreaBottom = toInt32(Math.min(matrix.height - 1, expectAlignmentY + alignmentAreaAllowanceSize));

  alignmentFinder.find(
    alignmentAreaLeft,
    alignmentAreaTop,
    alignmentAreaRight - alignmentAreaLeft,
    alignmentAreaBottom - alignmentAreaTop
  );

  return alignmentFinder.filter(expectAlignment, moduleSize);
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
      const size = FinderPatternGroup.size(finderPatternGroup);
      const version = fromVersionSize(size);

      // Find alignment
      if (version.alignmentPatterns.length > 0) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it
        const alignmentPatterns = findAlignmentInRegion(matrix, finderPatternGroup, strict);

        // Founded alignment
        for (const alignmentPattern of alignmentPatterns) {
          const transform = createTransform(finderPatternGroup, alignmentPattern);

          if (
            // Top left to top right
            checkMappingTimingLine(matrix, transform, size) &&
            // Top left to bottom left
            checkMappingTimingLine(matrix, transform, size, true)
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
          // Top left to top right
          checkMappingTimingLine(matrix, transform, size) &&
          // Top left to bottom left
          checkMappingTimingLine(matrix, transform, size, true)
        ) {
          // No alignment pattern version
          succeed = yield new Detect(matrix, transform, finderPatternGroup);
        }
      }

      iterator = finderPatternGroups.next(succeed);
    }
  }
}
