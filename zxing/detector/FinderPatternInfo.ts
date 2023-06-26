/**
 * @module FinderPatternInfo
 */

import { FinderPattern } from './FinderPattern';

export class FinderPatternInfo {
  #topLeft: FinderPattern;
  #topRight: FinderPattern;
  #bottomLeft: FinderPattern;

  constructor(patterns: FinderPattern[]) {
    [this.#bottomLeft, this.#topLeft, this.#topRight] = patterns;
  }

  public get topLeft(): FinderPattern {
    return this.#topLeft;
  }

  public get topRight(): FinderPattern {
    return this.#topRight;
  }

  public get bottomLeft(): FinderPattern {
    return this.#bottomLeft;
  }
}
