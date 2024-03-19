/**
 * @module Detector
 */

import { Pattern } from './Pattern';
import { Detected } from './Detected';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { createTransform } from './utils/transform';
import { checkMappingTimingLine } from './utils/timing';
import { FinderPatternGroup } from './FinderPatternGroup';
import { ALIGNMENT_PATTERN_RATIOS } from './PatternRatios';
import { FinderPatternFinder } from './FinderPatternFinder';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';
import { MIN_VERSION_SIZE_WITH_ALIGNMENTS } from '/common/Version';

export interface Options {
  /**
   * @property strict
   * @description Enable strict mode.
   */
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

  /**
   * @constructor
   * @param options The options of detector.
   */
  constructor(options: Options = {}) {
    this.#options = options;
  }

  /**
   * @method detect Detect the binarized image matrix.
   * @param matrix The binarized image matrix.
   */
  public *detect(matrix: BitMatrix): Generator<Detected, void, boolean> {
    const { strict } = this.#options;
    const { width, height } = matrix;
    const finderFinder = new FinderPatternFinder(matrix, strict);

    finderFinder.find(0, 0, width, height);

    const finderPatternGroups = finderFinder.groups();

    let current = finderPatternGroups.next();

    while (!current.done) {
      let succeed = false;

      const finderPatternGroup = current.value;
      const size = FinderPatternGroup.size(finderPatternGroup);

      // Find alignment.
      if (size >= MIN_VERSION_SIZE_WITH_ALIGNMENTS) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it.
        const alignmentPatterns = findAlignmentInRegion(matrix, finderPatternGroup, strict);

        // Founded alignment.
        for (const alignmentPattern of alignmentPatterns) {
          const transform = createTransform(finderPatternGroup, alignmentPattern);

          if (
            // Top left to top right.
            checkMappingTimingLine(matrix, transform, size) &&
            // Top left to bottom left.
            checkMappingTimingLine(matrix, transform, size, true)
          ) {
            succeed = yield new Detected(matrix, transform, finderPatternGroup, alignmentPattern);

            // Succeed, skip next alignment pattern.
            if (succeed) {
              break;
            }
          }
        }
      } else {
        const transform = createTransform(finderPatternGroup);

        if (
          // Top left to top right.
          checkMappingTimingLine(matrix, transform, size) &&
          // Top left to bottom left.
          checkMappingTimingLine(matrix, transform, size, true)
        ) {
          // No alignment pattern version.
          succeed = yield new Detected(matrix, transform, finderPatternGroup);
        }
      }

      current = finderPatternGroups.next(succeed);
    }
  }
}
