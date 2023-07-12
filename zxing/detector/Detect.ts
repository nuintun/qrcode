/**
 * @module Detect
 */

import { Pattern } from './Pattern';
import { Point } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { GridSampler } from '/common/GridSampler';
import { createTransform } from './utils/transform';
import { FinderPatternGroup } from './FinderPatternGroup';
import { PerspectiveTransform } from '/common/PerspectiveTransform';

export class Detect {
  #matrix: BitMatrix;
  #alignment?: Pattern;
  #finder: FinderPatternGroup;
  #transform: PerspectiveTransform;

  constructor(matrix: BitMatrix, finder: FinderPatternGroup, alignment?: Pattern) {
    const transform = createTransform(finder, alignment);
    const sampler = new GridSampler(matrix, transform);
    const { size } = finder;

    this.#finder = finder;
    this.#matrix = matrix;
    this.#alignment = alignment;
    this.#transform = transform;
    this.#matrix = sampler.sample(size, size);
  }

  public get size(): number {
    return this.#finder.size;
  }

  public get matrix(): BitMatrix {
    return this.#matrix;
  }

  public get finder(): FinderPatternGroup {
    return this.#finder;
  }

  public get alignment(): Pattern | undefined {
    return this.#alignment;
  }

  public mapping(x: number, y: number): Point {
    return new Point(...this.#transform.mapping(x, y));
  }
}
