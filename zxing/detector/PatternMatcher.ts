/**
 * @module PatternMatcher
 */

import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { alignCrossPattern, centerFromEnd, checkDiagonalPattern, getCountStateTotal } from './utils/matcher';

export interface Matcher {
  (countState: number[]): boolean;
}

export class PatternMatcher {
  #matcher: Matcher;
  #matrix: BitMatrix;
  #patterns: Pattern[] = [];

  constructor(matrix: BitMatrix, matcher: Matcher) {
    this.#matrix = matrix;
    this.#matcher = matcher;
  }

  #isDiagonalPassed(x: number, y: number, maxCount: number): boolean {
    const matrix = this.#matrix;
    const matcher = this.#matcher;

    return (
      checkDiagonalPattern(matrix, x, y, maxCount, true, matcher) &&
      checkDiagonalPattern(matrix, x, y, maxCount, false, matcher)
    );
  }

  #crossAlignHorizontal(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, true, this.#matcher);
  }

  #crossAlignVertical(x: number, y: number, maxCount: number): number {
    return alignCrossPattern(this.#matrix, x, y, maxCount, false, this.#matcher);
  }

  public get matrix(): BitMatrix {
    return this.#matrix;
  }

  public get patterns(): Pattern[] {
    return this.#patterns;
  }

  public match(x: number, y: number, countState: number[]): boolean {
    if (this.#matcher(countState)) {
      let offsetX = centerFromEnd(countState, x);

      const maxCount = countState[toInt32(countState.length / 2)];
      const offsetY = this.#crossAlignVertical(toInt32(offsetX), y, maxCount);

      if (offsetY >= 0) {
        // Re-cross check
        offsetX = this.#crossAlignHorizontal(toInt32(offsetX), toInt32(offsetY), maxCount);

        if (offsetX >= 0 && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), maxCount)) {
          const patterns = this.#patterns;
          const moduleSize = getCountStateTotal(countState) / 3;
          const { length } = patterns;

          for (let i = 0; i < length; i++) {
            const pattern = patterns[i];

            // Look for about the same center and module size
            if (pattern.equals(offsetX, offsetY, moduleSize)) {
              patterns[i] = pattern.combine(offsetX, offsetY, moduleSize);

              return true;
            }
          }

          // Hadn't found this before; save it
          patterns.push(new Pattern(offsetX, offsetY, moduleSize));

          return true;
        }
      }
    }

    return false;
  }
}
