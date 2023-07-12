/**
 * @module FinderPatternMatcher
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { checkPixelsInTimingLine } from './utils/timing';
import { FinderPatternGroup } from './FinderPatternGroup';
import { MAX_VERSION_SIZE, MIN_VERSION_SIZE } from '/common/Version';
import { isEqualsSize, isMatchFinderPattern } from './utils/pattern';
import { DIFF_EDGE_RATIO, FINDER_PATTERN_RATIOS } from './utils/constants';

export class FinderPatternMatcher extends PatternMatcher {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, FINDER_PATTERN_RATIOS, isMatchFinderPattern, strict);
  }

  public override match(x: number, y: number, scanline: number[]): boolean {
    return super.match(x, y, scanline, scanline[2]);
  }

  public *groups(): Generator<FinderPatternGroup, void, boolean> {
    const patterns = this.patterns.filter(({ combined }) => combined >= 3);
    const { length } = patterns;

    // Find enough finder patterns
    if (length >= 3) {
      // Max i1
      const maxI1 = length - 2;
      // Max i2
      const maxI2 = length - 1;
      // Used patterns
      const used = new Map<Pattern, boolean>();

      for (let i1 = 0; i1 < maxI1; i1++) {
        const pattern1 = patterns[i1];
        const width1 = pattern1.width;
        const height1 = pattern1.height;

        if (used.has(pattern1)) {
          continue;
        }

        for (let i2 = i1 + 1; i2 < maxI2; i2++) {
          const pattern2 = patterns[i2];
          const width2 = pattern2.width;
          const height2 = pattern2.height;

          if (used.has(pattern1)) {
            break;
          }

          if (
            used.has(pattern2) ||
            !isEqualsSize(width1, width2, DIFF_EDGE_RATIO) ||
            !isEqualsSize(height1, height2, DIFF_EDGE_RATIO)
          ) {
            continue;
          }

          for (let i3 = i2 + 1; i3 < length; i3++) {
            const pattern3 = patterns[i3];
            const width3 = pattern3.width;
            const height3 = pattern3.height;

            if (used.has(pattern1) || used.has(pattern2)) {
              break;
            }

            if (
              !isEqualsSize(width1, width3, DIFF_EDGE_RATIO) ||
              !isEqualsSize(width2, width3, DIFF_EDGE_RATIO) ||
              !isEqualsSize(height1, height3, DIFF_EDGE_RATIO) ||
              !isEqualsSize(height2, height3, DIFF_EDGE_RATIO)
            ) {
              continue;
            }

            const { matrix } = this;
            const finderPatternGroup = new FinderPatternGroup(matrix, [pattern1, pattern2, pattern3]);
            const { size, moduleSize } = finderPatternGroup;

            if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
              const [moduleSize1, moduleSize2] = moduleSize;

              // All tests passed!
              if (
                moduleSize1 >= 1 &&
                moduleSize2 >= 1 &&
                checkPixelsInTimingLine(matrix, finderPatternGroup) &&
                checkPixelsInTimingLine(matrix, finderPatternGroup, true)
              ) {
                if (yield finderPatternGroup) {
                  used.set(pattern1, true);
                  used.set(pattern2, true);
                  used.set(pattern3, true);
                }
              }
            }
          }
        }
      }
    }
  }
}
