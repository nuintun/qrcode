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
  #strict?: boolean;
  #matcher: Matcher;
  #matrix: BitMatrix;
  #modules: number;
  #patterns: Pattern[] = [];

  constructor(matrix: BitMatrix, modules: number, matcher: Matcher, strict?: boolean) {
    this.#matrix = matrix;
    this.#strict = strict;
    this.#matcher = matcher;
    this.#modules = modules;
  }

  #isDiagonalPassed(x: number, y: number, maxCount: number): boolean {
    const matrix = this.#matrix;
    const strict = this.#strict;
    const matcher = this.#matcher;

    if (checkDiagonalPattern(matrix, x, y, maxCount, matcher)) {
      if (strict) {
        return checkDiagonalPattern(matrix, x, y, maxCount, matcher, true);
      }

      return true;
    }

    return false;
  }

  #crossAlignVertical(x: number, y: number, maxCount: number): ReturnType<typeof alignCrossPattern> {
    return alignCrossPattern(this.#matrix, x, y, maxCount, this.#matcher, true);
  }

  #crossAlignHorizontal(x: number, y: number, maxCount: number): ReturnType<typeof alignCrossPattern> {
    return alignCrossPattern(this.#matrix, x, y, maxCount, this.#matcher);
  }

  public get matcher(): Matcher {
    return this.#matcher;
  }

  public get matrix(): BitMatrix {
    return this.#matrix;
  }

  public get patterns(): Pattern[] {
    return this.#patterns;
  }

  public match(x: number, y: number, countState: number[]): boolean {
    if (this.#matcher(countState)) {
      let countStateHorizontal;
      let offsetX = centerFromEnd(countState, x);

      const maxCount = countState[toInt32(countState.length / 2)];
      const [offsetY, countStateVertical] = this.#crossAlignVertical(toInt32(offsetX), y, maxCount);

      if (offsetY >= 0) {
        // Re-cross check
        [offsetX, countStateHorizontal] = this.#crossAlignHorizontal(toInt32(offsetX), toInt32(offsetY), maxCount);

        if (offsetX >= 0 && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), maxCount)) {
          const width = getCountStateTotal(countStateHorizontal);
          const height = getCountStateTotal(countStateVertical);
          const patterns = this.#patterns;
          const { length } = patterns;

          for (let i = 0; i < length; i++) {
            const pattern = patterns[i];

            // Look for about the same center and module size
            if (pattern.equals(offsetX, offsetY, width, height)) {
              patterns[i] = pattern.combine(offsetX, offsetY, width, height);

              return true;
            }
          }

          // Hadn't found this before; save it
          patterns.push(new Pattern(offsetX, offsetY, width, height, this.#modules));

          return true;
        }
      }
    }

    return false;
  }
}
