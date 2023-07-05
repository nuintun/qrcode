/**
 * @module Detector
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { setCountState } from './utils/matcher';
import { DetectResult, detect } from './utils/detector';
import { FinderPatternGroup } from './FinderPatternGroup';
import { FinderPatternMatcher } from './FinderPatternMatcher';
import { AlignmentPatternMatcher } from './AlignmentPatternMatcher';

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
    const { width, height } = matrix;
    const { transform } = this.#options;
    const finder = new FinderPatternMatcher(matrix);
    const alignment = new AlignmentPatternMatcher(matrix);
    // const finderPatternGroups = finder.find();

    const match = (x: number, y: number, lastBit: number, countState: number[], count: number) => {
      setCountState(countState, count);

      // Match pattern
      if (lastBit) {
        finder.match(x, y, countState);
      } else {
        alignment.match(x, y, countState.slice(-3));
      }
    };

    for (let y = 0; y < height; y++) {
      let x = 0;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < width && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const countState = [0, 0, 0, 0, 0];

      while (x < width) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          match(x, y, lastBit, countState, count);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      match(x, y, lastBit, countState, count);
    }

    return detect(matrix, finder, alignment, transform);
  }
}
