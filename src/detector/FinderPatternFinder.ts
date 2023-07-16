/**
 * @module FinderPatternFinder
 */

import { Pattern } from './Pattern';
import { round } from '/common/utils';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { scanlineUpdate } from './utils/scanline';
import { checkModulesInTimingLine } from './utils/timing';
import { MatchAction, PatternFinder } from './PatternFinder';
import { MAX_VERSION_SIZE, MIN_VERSION_SIZE } from '/common/Version';
import { isEqualsSize, isMatchFinderPattern } from './utils/pattern';
import { calculateTopLeftAngle, FinderPatternGroup } from './FinderPatternGroup';
import { DIFF_MODULE_SIZE_RATIO, FINDER_PATTERN_RATIOS, MAX_TOP_LEFT_ANGLE, MIN_TOP_LEFT_ANGLE } from './utils/constants';

export class FinderPatternFinder extends PatternFinder {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, FINDER_PATTERN_RATIOS, isMatchFinderPattern, strict);
  }

  public *groups(): Generator<FinderPatternGroup, void, boolean> {
    const patterns = this.patterns.filter(({ combined }) => combined >= 3);
    const { length } = patterns;

    if (length === 3) {
      const finderPatternGroup = new FinderPatternGroup(this.matrix, patterns);
      const { size } = finderPatternGroup;

      if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
        yield finderPatternGroup;
      }
    } else if (length > 3) {
      const maxI1 = length - 2;
      const maxI2 = length - 1;
      const used = new Map<Pattern, boolean>();

      for (let i1 = 0; i1 < maxI1; i1++) {
        const pattern1 = patterns[i1];
        const moduleSize1 = pattern1.moduleSize;

        // Pattern 1 used
        if (used.has(pattern1)) {
          continue;
        }

        for (let i2 = i1 + 1; i2 < maxI2; i2++) {
          const pattern2 = patterns[i2];
          const moduleSize2 = pattern2.moduleSize;

          // Pattern 1 used
          if (used.has(pattern1)) {
            break;
          }

          if (
            // Pattern 2 used
            used.has(pattern2) ||
            // Non equals module size
            !isEqualsSize(moduleSize1, moduleSize2, DIFF_MODULE_SIZE_RATIO)
          ) {
            continue;
          }

          for (let i3 = i2 + 1; i3 < length; i3++) {
            const pattern3 = patterns[i3];
            const moduleSize3 = pattern3.moduleSize;

            if (
              // Pattern 1 used
              used.has(pattern1) ||
              // Pattern 2 used
              used.has(pattern2)
            ) {
              break;
            }

            if (
              // Non equals module size
              !isEqualsSize(moduleSize1, moduleSize3, DIFF_MODULE_SIZE_RATIO) ||
              // Non equals module size
              !isEqualsSize(moduleSize2, moduleSize3, DIFF_MODULE_SIZE_RATIO)
            ) {
              continue;
            }

            const { matrix } = this;
            const finderPatternGroup = new FinderPatternGroup(matrix, [pattern1, pattern2, pattern3]);
            const angle = calculateTopLeftAngle(finderPatternGroup);

            if (angle >= MIN_TOP_LEFT_ANGLE && angle <= MAX_TOP_LEFT_ANGLE) {
              const [xModuleSize, yModuleSize] = finderPatternGroup.moduleSize;

              if (xModuleSize >= 1 && yModuleSize >= 1) {
                const { topLeft, topRight, bottomLeft } = finderPatternGroup;
                const edge1 = distance(topLeft, topRight);
                const edge2 = distance(topLeft, bottomLeft);

                if (Math.abs(round(edge1 / xModuleSize) - round(edge2 / yModuleSize)) <= 4) {
                  const { size } = finderPatternGroup;

                  if (
                    size >= MIN_VERSION_SIZE &&
                    size <= MAX_VERSION_SIZE &&
                    checkModulesInTimingLine(matrix, finderPatternGroup) &&
                    checkModulesInTimingLine(matrix, finderPatternGroup, true)
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
  }

  public find(left: number, top: number, width: number, height: number): void {
    const { matrix } = this;
    const right = left + width;
    const bottom = top + height;
    const match: MatchAction = (x, y, scanline, count, scanlineBits, lastBit) => {
      scanlineUpdate(scanline, count);
      scanlineUpdate(scanlineBits, lastBit);

      // Match pattern black-white-black-white-black
      if (
        scanlineBits[0] === 1 &&
        scanlineBits[1] === 0 &&
        scanlineBits[2] === 1 &&
        scanlineBits[3] === 0 &&
        scanlineBits[4] === 1
      ) {
        this.match(x, y, scanline, scanline[2]);
      }
    };

    for (let y = top; y < bottom; y++) {
      let x = left;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < right && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const scanline = [0, 0, 0, 0, 0];
      const scanlineBits = [-1, -1, -1, -1, -1];

      while (x < right) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          match(x, y, scanline, count, scanlineBits, lastBit);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      match(x, y, scanline, count, scanlineBits, lastBit);
    }
  }
}
