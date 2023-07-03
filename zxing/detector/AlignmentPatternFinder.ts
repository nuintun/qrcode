/**
 * @module AlignmentPatternFinder
 */

import {
  alignCrossPattern,
  centerFromEnd,
  checkDiagonalPattern,
  getStateCountTotal,
  isFoundAlignmentPattern,
  pushStateCount
} from './utils/finder';
import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';

export class AlignmentPatternFinder {
  #x: number;
  #y: number;
  #width: number;
  #height: number;
  #matrix: BitMatrix;

  constructor(matrix: BitMatrix, x: number, y: number, width: number, height: number) {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    this.#matrix = matrix;
  }

  #crossAlignHorizontal(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, true, isFoundAlignmentPattern);
  }

  #crossAlignVertical(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, false, isFoundAlignmentPattern);
  }

  #isDiagonalPassed(x: number, y: number, maxCount: number): boolean {
    const matrix = this.#matrix;

    return (
      checkDiagonalPattern(matrix, x, y, maxCount, true, isFoundAlignmentPattern) &&
      checkDiagonalPattern(matrix, x, y, maxCount, false, isFoundAlignmentPattern)
    );
  }

  #find(patterns: Pattern[], x: number, y: number, stateCount: number[], maxCount: number): Pattern | undefined {
    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossAlignVertical(toInt32(offsetX), y, maxCount);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossAlignHorizontal(toInt32(offsetX), toInt32(offsetY), maxCount);

      if (!Number.isNaN(offsetX) && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), maxCount)) {
        const moduleSize = getStateCountTotal(stateCount) / 3;

        for (const pattern of patterns) {
          // Look for about the same center and module size
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            return pattern.combine(offsetX, offsetY, moduleSize);
          }
        }

        // Hadn't found this before; save it
        patterns.push(new Pattern(offsetX, offsetY, moduleSize));
      }
    }
  }

  public find(): Pattern | undefined {
    const startX = this.#x;
    const startY = this.#y;
    const matrix = this.#matrix;
    const patterns: Pattern[] = [];
    const width = startX + this.#width;
    const height = startY + this.#height;
    const process = (x: number, y: number, stateCount: number[], count: number) => {
      pushStateCount(stateCount, count);

      if (isFoundAlignmentPattern(stateCount)) {
        return this.#find(patterns, x, y, stateCount, stateCount[1]);
      }
    };

    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    for (let y = startY; y < height; y++) {
      let x = startX;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < width && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const stateCount = [0, 0, 0];

      while (x < width) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          // Yes
          const confirmed = process(x, y, stateCount, count);

          if (confirmed != null) {
            return confirmed;
          }

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      const confirmed = process(x, y, stateCount, count);

      if (confirmed != null) {
        return confirmed;
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    return patterns[0];
  }
}
