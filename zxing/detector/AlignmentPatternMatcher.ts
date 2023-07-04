/**
 * @module AlignmentPatternMatcher
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { getCountStateTotal, isMatchAlignmentPattern } from './utils/matcher';

export class AlignmentPatternMatcher {
  #matcher: PatternMatcher;

  constructor(matrix: BitMatrix) {
    this.#matcher = new PatternMatcher(matrix, isMatchAlignmentPattern);
  }

  public get patterns(): Pattern[] {
    return this.#matcher.patterns;
  }

  public match(x: number, y: number, countState: number[]): boolean {
    const matcher = this.#matcher;

    if (matcher.matrix.get(x, y)) {
      return false;
    }

    return this.#matcher.match(x, y, countState, getCountStateTotal(countState) / 3);
  }
}
