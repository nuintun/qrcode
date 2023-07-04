/**
 * @module Detector
 */

import { Pattern } from './Pattern';
import { detect } from './utils/detector';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from './FinderPatternGroup';
import { FinderPatternFinder } from './FinderPatternFinder';

export interface DetectResult {
  readonly matrix: BitMatrix;
  readonly alignment?: Pattern;
  readonly bottomRight: Pattern;
  readonly finder: FinderPatternGroup;
}

export interface Options {
  transform?: (
    matrix: BitMatrix,
    size: number,
    finderPatternGroup: FinderPatternGroup,
    alignmentPattern?: Pattern
  ) => BitMatrix;
}

export class Detector {
  #options: Options;

  constructor(options: Options = {}) {
    this.#options = options;
  }

  public detect(matrix: BitMatrix): DetectResult[] {
    const result: DetectResult[] = [];
    const { transform } = this.#options;
    const finder = new FinderPatternFinder(matrix);
    const finderPatternGroups = finder.find();

    for (const patterns of finderPatternGroups) {
      const [bitMatrix, alignmentPattern] = detect(matrix, patterns, transform);
      const { topLeft, topRight, bottomLeft } = patterns;

      const bottomRight = new Pattern(
        topRight.x - topLeft.x + bottomLeft.x,
        topRight.y - topLeft.y + bottomLeft.y,
        topLeft.moduleSize
      );

      if (bitMatrix != null) {
        if (alignmentPattern) {
          result.push({
            bottomRight,
            finder: patterns,
            matrix: bitMatrix,
            alignment: alignmentPattern
          });
        } else {
          result.push({
            bottomRight,
            finder: patterns,
            matrix: bitMatrix
          });
        }
      }
    }

    return result;
  }
}
