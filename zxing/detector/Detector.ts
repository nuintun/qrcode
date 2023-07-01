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
  readonly patterns: FinderPatternGroup;
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
    const finderPatternGroups = finder.find(strict);

    for (const patterns of finderPatternGroups) {
      const [bitMatrix, alignmentPattern] = detect(matrix, patterns, strict);

      if (bitMatrix != null) {
        result.push({
          patterns,
          matrix: bitMatrix,
          alignment: alignmentPattern
        });
      }
    }

    return result;
  }
}
