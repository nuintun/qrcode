/**
 * @module Detected
 */

import { Pattern } from './Pattern';
import { Point } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { GridSampler } from '/common/GridSampler';
import { FinderPatternGroup } from './FinderPatternGroup';
import { PerspectiveTransform } from '/common/PerspectiveTransform';

export class Detected {
  #matrix: BitMatrix;
  #alignment?: Pattern;
  #finder: FinderPatternGroup;
  #transform: PerspectiveTransform;

  constructor(
    matrix: BitMatrix,
    transform: PerspectiveTransform,
    finderPatternGroup: FinderPatternGroup,
    alignmentPattern?: Pattern
  ) {
    const sampler = new GridSampler(matrix, transform);
    const size = FinderPatternGroup.size(finderPatternGroup);

    this.#matrix = matrix;
    this.#transform = transform;
    this.#finder = finderPatternGroup;
    this.#alignment = alignmentPattern;
    this.#matrix = sampler.sample(size, size);
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

  public get size(): number {
    return FinderPatternGroup.size(this.#finder);
  }

  public get moduleSize(): number {
    return FinderPatternGroup.moduleSize(this.#finder);
  }

  public mapping(x: number, y: number): Point {
    [x, y] = this.#transform.mapping(x, y);

    return new Point(x, y);
  }
}
