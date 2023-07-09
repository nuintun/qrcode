/**
 * @module FinderPatternGroup
 */

import { Pattern } from './Pattern';
import { orderFinderPatterns } from './utils/pattern';

export class FinderPatternGroup {
  #patterns: Pattern[];

  constructor(patterns: Pattern[]) {
    this.#patterns = orderFinderPatterns(patterns);
  }

  public get topLeft(): Pattern {
    return this.#patterns[0];
  }

  public get topRight(): Pattern {
    return this.#patterns[1];
  }

  public get bottomLeft(): Pattern {
    return this.#patterns[2];
  }
}
