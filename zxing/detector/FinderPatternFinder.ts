/**
 * @module FinderPatternFinder
 */

import { Pattern } from './Pattern';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { scanlineUpdate } from './utils/scanline';
import { checkPixelsInTimingLine } from './utils/timing';
import { FinderPatternGroup } from './FinderPatternGroup';
import { MatchAction, PatternFinder } from './PatternFinder';
import { MAX_VERSION_SIZE, MIN_VERSION_SIZE } from '/common/Version';
import { isEqualsSize, isMatchFinderPattern } from './utils/pattern';
import { DIFF_EDGE_RATIO, DIFF_MODULE_SIZE_RATIO, FINDER_PATTERN_RATIOS } from './utils/constants';

export class FinderPatternFinder extends PatternFinder {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, FINDER_PATTERN_RATIOS, isMatchFinderPattern, strict);
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
        const [xModuleSize1, yModuleSize1] = pattern1.moduleSize;

        if (used.has(pattern1)) {
          continue;
        }

        for (let i2 = i1 + 1; i2 < maxI2; i2++) {
          const pattern2 = patterns[i2];
          const [xModuleSize2, yModuleSize2] = pattern2.moduleSize;

          if (used.has(pattern1)) {
            break;
          }

          if (
            used.has(pattern2) ||
            !isEqualsSize(xModuleSize1, xModuleSize2, DIFF_MODULE_SIZE_RATIO) ||
            !isEqualsSize(yModuleSize1, yModuleSize2, DIFF_MODULE_SIZE_RATIO)
          ) {
            continue;
          }

          for (let i3 = i2 + 1; i3 < length; i3++) {
            const pattern3 = patterns[i3];
            const [xModuleSize3, yModuleSize3] = pattern3.moduleSize;

            if (used.has(pattern1) || used.has(pattern2)) {
              break;
            }

            if (
              !isEqualsSize(xModuleSize1, xModuleSize3, DIFF_MODULE_SIZE_RATIO) ||
              !isEqualsSize(xModuleSize2, xModuleSize3, DIFF_MODULE_SIZE_RATIO) ||
              !isEqualsSize(yModuleSize1, yModuleSize3, DIFF_MODULE_SIZE_RATIO) ||
              !isEqualsSize(yModuleSize2, yModuleSize3, DIFF_MODULE_SIZE_RATIO)
            ) {
              continue;
            }

            const { matrix } = this;
            const finderPatternGroup = new FinderPatternGroup(matrix, [pattern1, pattern2, pattern3]);
            const { topLeft, topRight, bottomLeft } = finderPatternGroup;
            const edge1 = distance(topLeft, topRight);
            const edge2 = distance(topLeft, bottomLeft);

            if (isEqualsSize(edge1, edge2, DIFF_EDGE_RATIO)) {
              const { size } = finderPatternGroup;

              if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
                const { moduleSize } = finderPatternGroup;
                const [moduleSize1, moduleSize2] = moduleSize;

                if (moduleSize1 >= 1 && moduleSize2 >= 1) {
                  const [passed1, modules1] = checkPixelsInTimingLine(matrix, finderPatternGroup);

                  if (passed1) {
                    const [passed2, modules2] = checkPixelsInTimingLine(matrix, finderPatternGroup, true);

                    if (passed2 && Math.abs(modules1 - modules2) <= 12) {
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
