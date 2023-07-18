/**
 * @module PatternRatios
 */

import { sumArray } from '/common/utils';

export class PatternRatios {
  #modules: number;
  #ratios: number[];

  constructor(ratios: number[]) {
    this.#ratios = ratios;
    this.#modules = sumArray(ratios);
  }

  public get modules(): number {
    return this.#modules;
  }

  public get ratios(): number[] {
    return this.#ratios;
  }
}

export const FINDER_PATTERN_RATIOS = new PatternRatios([1, 1, 3, 1, 1]);
export const ALIGNMENT_PATTERN_RATIOS = new PatternRatios([1, 1, 1, 1, 1]);
export const ALIGNMENT_PATTERN_LOOSE_MODE_RATIOS = new PatternRatios([1, 1, 1]);
