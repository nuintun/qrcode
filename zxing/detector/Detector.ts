/**
 * @module Detector
 */

import { Detect } from './Detect';
import { BitMatrix } from '/common/BitMatrix';
import { fromVersionSize } from '/common/Version';
import { scanlineUpdate } from './utils/scanline';
import { FinderPatternMatcher } from './FinderPatternMatcher';
import { AlignmentPatternMatcher } from './AlignmentPatternMatcher';

export interface Options {
  strict?: boolean;
}

function* detect(
  matrix: BitMatrix,
  finderMatcher: FinderPatternMatcher,
  alignmentMatcher: AlignmentPatternMatcher
): Generator<Detect, void, boolean> {
  const finderPatternGroups = finderMatcher.groups();

  let iterator = finderPatternGroups.next();

  while (!iterator.done) {
    let succeed = false;

    const finderPatternGroup = iterator.value;
    const version = fromVersionSize(finderPatternGroup.size);

    // Find alignment
    if (version.alignmentPatterns.length > 0) {
      // Kind of arbitrary -- expand search radius before giving up
      // If we didn't find alignment pattern... well try anyway without it
      const alignmentPatterns = alignmentMatcher.filter(finderPatternGroup);

      // Founded alignment
      for (const alignmentPattern of alignmentPatterns) {
        succeed = yield new Detect(matrix, finderPatternGroup, alignmentPattern);

        // Succeed, skip next alignment pattern
        if (succeed) {
          break;
        }
      }

      // All failed with alignment pattern
      if (!succeed) {
        // Fallback with no alignment pattern
        succeed = yield new Detect(matrix, finderPatternGroup);
      }
    } else {
      // No alignment pattern version
      succeed = yield new Detect(matrix, finderPatternGroup);
    }

    iterator = finderPatternGroups.next(succeed);
  }
}

export class Detector {
  #options: Options;

  constructor(options: Options = {}) {
    this.#options = options;
  }

  public detect(matrix: BitMatrix): Generator<Detect, void, boolean> {
    const { strict } = this.#options;
    const { width, height } = matrix;
    const finderMatcher = new FinderPatternMatcher(matrix, strict);
    const alignmentMatcher = new AlignmentPatternMatcher(matrix, strict);

    const match = (x: number, y: number, lastBit: number, scanline: number[], count: number) => {
      scanlineUpdate(scanline, count);

      // Match pattern
      if (lastBit) {
        finderMatcher.match(x, y, scanline);
      } else {
        alignmentMatcher.match(x, y, scanline);
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

      const scanline = [0, 0, 0, 0, 0];

      while (x < width) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          match(x, y, lastBit, scanline, count);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      match(x, y, lastBit, scanline, count);
    }

    return detect(matrix, finderMatcher, alignmentMatcher);
  }
}
