/**
 * @module FinderPatternGroup
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { orderFinderPatterns } from './utils/pattern';
import { calculateModuleSizeOneWay, ModuleSizeGroup } from './utils/module';

export class FinderPatternGroup {
  #patterns: Pattern[];
  #moduleSize: ModuleSizeGroup;

  constructor(matrix: BitMatrix, patterns: Pattern[]) {
    this.#patterns = orderFinderPatterns(patterns);

    const [topLeft, topRight, bottomLeft] = this.#patterns;

    this.#moduleSize = [
      calculateModuleSizeOneWay(matrix, topLeft, topRight),
      calculateModuleSizeOneWay(matrix, topLeft, bottomLeft)
    ];
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

  public get moduleSize(): ModuleSizeGroup {
    return this.#moduleSize;
  }
}
