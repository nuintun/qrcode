/**
 * @module Detect
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { GridSampler } from '/common/GridSampler';
import { createTransform } from './utils/transform';
import { FinderPatternGroup } from './FinderPatternGroup';

export class Detect {
  #size: number;
  #matrix: BitMatrix;
  #alignment?: Pattern;
  #extract?: BitMatrix;
  #finder: FinderPatternGroup;

  constructor(matrix: BitMatrix, size: number, finder: FinderPatternGroup, alignment?: Pattern) {
    this.#size = size;
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

    const size = this.#size;
    const sampler = new GridSampler(this.#matrix);

    extract = sampler.sampleGrid(size, size, createTransform(size, this.#finder, this.#alignment));

    this.#extract = extract;

    return extract;
  }
}
