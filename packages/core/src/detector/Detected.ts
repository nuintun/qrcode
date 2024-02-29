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

  /**
   * @property matrix
   * @description Get the matrix.
   */
  public get matrix(): BitMatrix {
    return this.#matrix;
  }

  /**
   * @property finder
   * @description Get the finder pattern.
   */
  public get finder(): FinderPatternGroup {
    return this.#finder;
  }

  /**
   * @property alignment
   * @description Get the alignment pattern.
   */
  public get alignment(): Pattern | undefined {
    return this.#alignment;
  }

  /**
   * @property size
   * @description Get the size.
   */
  public get size(): number {
    return FinderPatternGroup.size(this.#finder);
  }

  /**
   * @property moduleSize
   * @description Get the module size.
   */
  public get moduleSize(): number {
    return FinderPatternGroup.moduleSize(this.#finder);
  }

  /**
   * @method mapping
   * @description Get the mapped point.
   * @param x The x of point.
   * @param y The y of point.
   */
  public mapping(x: number, y: number): Point {
    [x, y] = this.#transform.mapping(x, y);

    return new Point(x, y);
  }
}
