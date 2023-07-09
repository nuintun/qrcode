/**
 * @module FinderPatternMatcher
 */

import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { checkPixelsInTimingLine } from './utils/timing';
import { FinderPatternGroup } from './FinderPatternGroup';
import { isEqualsEdge, isMatchFinderPattern } from './utils/pattern';

export class FinderPatternMatcher extends PatternMatcher {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, 7, isMatchFinderPattern, strict);
  }

  public groups(): FinderPatternGroup[] {
    const patterns = this.patterns.filter(({ combined }) => combined >= 3);
    const finderPatternGroups: FinderPatternGroup[] = [];
    const { length } = patterns;

    // Find enough finder patterns
    if (length >= 3) {
      // Max i1
      const maxI1 = length - 2;
      // Max i2
      const maxI2 = length - 1;

      // Sort patterns
      patterns.sort((pattern1, pattern2) => pattern2.width - pattern1.width);

      for (let i1 = 0; i1 < maxI1; i1++) {
        const pattern1 = patterns[i1];
        const width1 = pattern1.width;
        const height1 = pattern1.height;

        for (let i2 = i1 + 1; i2 < maxI2; i2++) {
          const pattern2 = patterns[i2];
          const width2 = pattern2.width;
          const height2 = pattern2.height;

          if (!isEqualsEdge(width1, width2)) {
            break;
          }

          if (!isEqualsEdge(height1, height2)) {
            continue;
          }

          for (let i3 = i2 + 1; i3 < length; i3++) {
            const pattern3 = patterns[i3];

            if (!isEqualsEdge(width2, pattern3.width)) {
              break;
            }

            if (!isEqualsEdge(height2, pattern3.height)) {
              continue;
            }

            const { matrix } = this;
            const finderPatternGroup = new FinderPatternGroup(matrix, [pattern1, pattern2, pattern3]);
            const { topLeft, topRight, bottomLeft, moduleSize } = finderPatternGroup;

            // Invalid module size
            if (moduleSize[0] < 1 || moduleSize[1] < 1) {
              continue;
            }

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

            if (
              checkPixelsInTimingLine(matrix, finderPatternGroup) &&
              checkPixelsInTimingLine(matrix, finderPatternGroup, true)
            ) {
              // All tests passed!
              finderPatternGroups.push(finderPatternGroup);
            }
          }
        }
      }
    }

    return finderPatternGroups;
  }
}
