/**
 * @module FinderPatternMatcher
 */

import {
  checkRepeatPixelsInLine,
  isEqualsEdge,
  isEqualsModuleSize,
  isMatchFinderPattern,
  isValidModuleCount
} from './utils/matcher';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { FinderPatternGroup } from './FinderPatternGroup';

export class FinderPatternMatcher {
  #matcher: PatternMatcher;

  constructor(matrix: BitMatrix) {
    this.#matcher = new PatternMatcher(matrix, isMatchFinderPattern);
  }

  public get patterns(): FinderPatternGroup[] {
    const { matrix, patterns } = this.#matcher;
    const finderPatternGroups: FinderPatternGroup[] = [];
    const { length } = patterns;

    // Find enough finder patterns
    if (length >= 3) {
      // Max i1
      const maxI1 = length - 2;
      // Max i2
      const maxI2 = length - 1;

      // Sort patterns
      patterns.sort((pattern1, pattern2) => pattern2.moduleSize - pattern1.moduleSize);

      for (let i1 = 0; i1 < maxI1; i1++) {
        const pattern1 = patterns[i1];
        const moduleSize1 = pattern1.moduleSize;

        for (let i2 = i1 + 1; i2 < maxI2; i2++) {
          const pattern2 = patterns[i2];
          const moduleSize2 = pattern2.moduleSize;

          if (!isEqualsModuleSize(moduleSize1, moduleSize2)) {
            break;
          }

          for (let i3 = i2 + 1; i3 < length; i3++) {
            const pattern3 = patterns[i3];

            if (!isEqualsModuleSize(moduleSize2, pattern3.moduleSize)) {
              break;
            }

            const finderPatternGroup = new FinderPatternGroup([pattern1, pattern2, pattern3]);
            const { topLeft, topRight, bottomLeft } = finderPatternGroup;
            const edge1 = distance(bottomLeft, topLeft);
            const edge2 = distance(topLeft, topRight);

            // Calculate the difference of the cathetus lengths in percent
            if (!isEqualsEdge(edge1, edge2)) {
              continue;
            }

            const hypotenuse = distance(topRight, bottomLeft);

            // Calculate the difference of the hypotenuse lengths in percent
            if (!isEqualsEdge(Math.sqrt(edge1 * edge1 + edge2 * edge2), hypotenuse)) {
              continue;
            }

            // Check the sizes
            const topLeftModuleSize = topLeft.moduleSize;

            if (
              !isValidModuleCount(edge1, (bottomLeft.moduleSize + topLeftModuleSize) / 2) ||
              !isValidModuleCount(edge2, (topLeftModuleSize + topRight.moduleSize) / 2)
            ) {
              continue;
            }

            if (checkRepeatPixelsInLine(matrix, topLeft, bottomLeft) && checkRepeatPixelsInLine(matrix, topRight, bottomLeft)) {
              // All tests passed!
              finderPatternGroups.push(finderPatternGroup);
            }
          }
        }
      }
    }

    return finderPatternGroups;
  }

  public match(x: number, y: number, countState: number[]): boolean {
    const matcher = this.#matcher;

    if (!matcher.matrix.get(x, y)) {
      return false;
    }

    return this.#matcher.match(x, y, countState);
  }
}
