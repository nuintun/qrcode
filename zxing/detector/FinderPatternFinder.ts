/**
 * @module FinderPatternFinder
 */

import {
  alignCrossPattern,
  centerFromEnd,
  checkDiagonalPattern,
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

  #crossCheckHorizontal(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, true, isFoundFinderPattern);
  }

  #crossCheckVertical(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, false, isFoundFinderPattern);
  }

  #isFoundDiagonalPattern(x: number, y: number, maxCount: number): boolean {
    return checkDiagonalPattern(this.#matrix, x, y, maxCount, isFoundFinderPattern);
  }

  #process(patterns: Pattern[], x: number, y: number, stateCount: number[]): void {
    let offsetX = centerFromEnd(stateCount, x);

    const maxCount = stateCount[2];
    const offsetY = this.#crossCheckVertical(toInt32(offsetX), y, maxCount);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(toInt32(offsetX), toInt32(offsetY), maxCount);

      if (!Number.isNaN(offsetX) && this.#isFoundDiagonalPattern(toInt32(offsetX), toInt32(offsetY), maxCount)) {
        let found = false;

        const { length } = patterns;
        const moduleSize = getStateCountTotal(stateCount) / 7;

        for (let i = 0; i < length; i++) {
          const pattern = patterns[i];

          // Look for about the same center and module size:
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            found = true;
            patterns[i] = pattern.combine(offsetX, offsetY, moduleSize);
            break;
          }
        }

        if (!found) {
          patterns.push(new Pattern(offsetX, offsetY, moduleSize));
        }
      }
    }
  }

  #selectBestPatterns(patterns: Pattern[]): FinderPatternGroup[] {
    const { length } = patterns;

    // Couldn't find enough finder patterns
    if (length < 3) {
      return [];
    }

    // Max i1
    const maxI1 = length - 2;
    // Max i2
    const maxI2 = length - 1;
    // Groups
    const finderPatternGroups: FinderPatternGroup[] = [];

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

          // All tests passed!
          finderPatternGroups.push(finderPatternGroup);
        }
      }
    }

    return finderPatternGroups;
  }

  public find(): FinderPatternGroup[] {
    const matrix = this.#matrix;
    const patterns: Pattern[] = [];
    const { width, height } = matrix;

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
      const process = (x: number, y: number) => {
        pushStateCount(stateCount, count);

        if (isFoundFinderPattern(stateCount)) {
          this.#process(patterns, x, y, stateCount);
        }
      };

      while (x < width) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          process(x, y);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      process(width - 1, y);
    }

    return this.#selectBestPatterns(patterns);
  }
}
