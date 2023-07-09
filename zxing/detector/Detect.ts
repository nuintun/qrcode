/**
 * @module Detect
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { GridSampler } from '/common/GridSampler';
import { createTransform } from './utils/transform';
import { FinderPatternGroup } from './FinderPatternGroup';

export class Detect {
  #matrix: BitMatrix;
  #alignment?: Pattern;
  #extract?: BitMatrix;
  #finder: FinderPatternGroup;

  constructor(matrix: BitMatrix, finder: FinderPatternGroup, alignment?: Pattern) {
    this.#finder = finder;
    this.#matrix = matrix;
    this.#alignment = alignment;
  }

  public get finder(): FinderPatternGroup {
    return this.#finder;
  }

  public get alignment(): Pattern | undefined {
    return this.#alignment;
  }

  public get matrix(): BitMatrix {
    let extract = this.#extract;

    if (extract) {
      return extract;
    }

    const sampler = new GridSampler(this.#matrix);
    const finder = this.#finder;
    const { size } = finder;

    extract = sampler.sampleGrid(size, size, createTransform(finder, this.#alignment));

    this.#extract = extract;

    return extract;
  }
}
