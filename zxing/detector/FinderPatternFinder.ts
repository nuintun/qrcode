/**
 * @module FinderPatternFinder
 */

import {
  alignCrossPattern,
  centerFromEnd,
  checkDiagonalPattern,
  checkRepeatPixelsInLine,
  getStateCountTotal,
  isEqualsEdge,
  isEqualsModuleSize,
  isFoundFinderPattern,
  isValidModuleCount,
  pushStateCount
} from './utils/finder';
import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from './FinderPatternGroup';

export class FinderPatternFinder {
  #matrix: BitMatrix;

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #crossAlignHorizontal(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, true, isFoundFinderPattern);
  }

  #crossAlignVertical(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, false, isFoundFinderPattern);
  }

  #isDiagonalPassed(x: number, y: number, maxCount: number): boolean {
    const matrix = this.#matrix;

    return (
      checkDiagonalPattern(matrix, x, y, maxCount, true, isFoundFinderPattern) &&
      checkDiagonalPattern(matrix, x, y, maxCount, false, isFoundFinderPattern)
    );
  }

  #selectBestPatterns(patterns: Pattern[]): FinderPatternGroup[] {
    const matrix = this.#matrix;
    const { length } = patterns;
    // Groups
    const finderPatternGroups: FinderPatternGroup[] = [];

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

  #match(patterns: Pattern[], x: number, y: number, stateCount: number[], maxCount: number): void {
    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossAlignVertical(toInt32(offsetX), y, maxCount);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossAlignHorizontal(toInt32(offsetX), toInt32(offsetY), maxCount);

      if (!Number.isNaN(offsetX) && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), maxCount)) {
        let combined = false;

        const { length } = patterns;
        const moduleSize = getStateCountTotal(stateCount) / 7;

        for (let i = 0; i < length; i++) {
          const pattern = patterns[i];

          // Look for about the same center and module size:
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            combined = true;
            patterns[i] = pattern.combine(offsetX, offsetY, moduleSize);
            break;
          }
        }

        if (!combined) {
          patterns.push(new Pattern(offsetX, offsetY, moduleSize));
        }
      }
    }
  }

  public find(): FinderPatternGroup[] {
    const matrix = this.#matrix;
    const patterns: Pattern[] = [];
    const { width, height } = matrix;
    const match = (x: number, y: number, lastBit: number, stateCount: number[], count: number) => {
      pushStateCount(stateCount, count);

      if (lastBit && isFoundFinderPattern(stateCount)) {
        this.#match(patterns, x, y, stateCount, stateCount[2]);
      }
    };

    for (let y = 0; y < height; y++) {
      let x = 0;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < width && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const stateCount = [0, 0, 0, 0, 0];

      while (x < width) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          match(x, y, lastBit, stateCount, count);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      match(x, y, lastBit, stateCount, count);
    }

    return this.#selectBestPatterns(patterns.filter(({ count }) => count >= 3));
  }
}
