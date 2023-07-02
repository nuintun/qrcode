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
  readonly finder: FinderPatternGroup;
}

export interface Options {
  strict?: boolean;
}

export class Detector {
  #options: Options;

  constructor(options: Options = {}) {
    this.#options = options;
  }

  public detect(matrix: BitMatrix): DetectResult[] {
    const result: DetectResult[] = [];
    const { strict = true } = this.#options;
    const finder = new FinderPatternFinder(matrix);
    const finderPatternGroups = finder.find();

    for (const patterns of finderPatternGroups) {
      const [bitMatrix, alignmentPattern] = detect(matrix, patterns, strict);

      if (bitMatrix != null) {
        if (alignmentPattern) {
          result.push({
            finder: patterns,
            matrix: bitMatrix,
            alignment: alignmentPattern
          });
        } else {
          result.push({
            finder: patterns,
            matrix: bitMatrix
          });
        }
      }
    }

    return result;
  }
}
