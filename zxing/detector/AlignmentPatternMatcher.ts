/**
 * @module AlignmentPatternMatcher
 */

import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { getCountStateTotal, isMatchAlignmentPattern } from './utils/matcher';

export class AlignmentPatternMatcher extends PatternMatcher {
  constructor(matrix: BitMatrix) {
    super(matrix, isMatchAlignmentPattern);
  }

  public override match(x: number, y: number, countState: number[]): boolean {
    return super.match(x, y, countState, getCountStateTotal(countState) / 3);
  }
}
