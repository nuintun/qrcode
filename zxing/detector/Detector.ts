/**
 * @module Detector
 */

import { Detect } from './Detect';
import { Pattern } from './Pattern';
import { Point } from '/common/Point';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { fromVersionSize } from '/common/Version';
import { calculateModuleSize } from './utils/module';
import { FinderPatternGroup } from './FinderPatternGroup';
import { FinderPatternFinder } from './FinderPatternFinder';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';

export interface Options {
  strict?: boolean;
}

function findAlignmentInRegion(
  matrix: BitMatrix,
  { size, moduleSize, topLeft, topRight, bottomLeft }: FinderPatternGroup,
  strict?: boolean
): Pattern[] {
  const { x, y } = topLeft;
  const correctionToTopLeft = 1 - 3 / (size - 7);
  const allowance = Math.min(15, toInt32(size / 4));
  const bottomRightX = topRight.x + bottomLeft.x - x;
  const bottomRightY = topRight.y + bottomLeft.y - y;
  const moduleSizeAvg = calculateModuleSize(moduleSize);
  const alignmentFinder = new AlignmentPatternFinder(matrix, strict);
  // Look for an alignment pattern allowance modules in size around where it should be
  const alignmentAreaAllowance = Math.ceil(moduleSizeAvg * allowance);
  const expectAlignmentX = toInt32(x + correctionToTopLeft * (bottomRightX - x));
  const expectAlignmentY = toInt32(y + correctionToTopLeft * (bottomRightY - y));
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

  return alignmentFinder.filter(new Point(expectAlignmentX, expectAlignmentY), moduleSizeAvg);
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
      const version = fromVersionSize(finderPatternGroup.size);

      // Find alignment
      if (version.alignmentPatterns.length > 0) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it
        const alignmentPatterns = findAlignmentInRegion(matrix, finderPatternGroup);

        // Founded alignment
        for (const alignmentPattern of alignmentPatterns) {
          succeed = yield new Detect(matrix, finderPatternGroup, alignmentPattern);

          // Succeed, skip next alignment pattern
          if (succeed) {
            break;
          }
        }

        // All failed with alignment pattern
        if (!succeed) {
          // Fallback with no alignment pattern
          succeed = yield new Detect(matrix, finderPatternGroup);
        }
      } else {
        // No alignment pattern version
        succeed = yield new Detect(matrix, finderPatternGroup);
      }

      iterator = finderPatternGroups.next(succeed);
    }
  }
}
