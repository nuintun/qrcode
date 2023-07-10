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

export class Detector {
  #options: Options;

  constructor(options: Options = {}) {
    this.#options = options;
  }

  public detect(matrix: BitMatrix): Detect[] {
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

function detect(matrix: BitMatrix, finderMatcher: FinderPatternMatcher, alignmentMatcher: AlignmentPatternMatcher): Detect[] {
  const detected: Detect[] = [];
  const finderPatternGroups = finderMatcher.groups();

  for (const finderPatternGroup of finderPatternGroups) {
    const { size } = finderPatternGroup;
    const version = fromVersionSize(size);

    // Find alignment
    if (version.alignmentPatterns.length > 0) {
      // Kind of arbitrary -- expand search radius before giving up
      // If we didn't find alignment pattern... well try anyway without it
      const alignmentPatterns = alignmentMatcher.filter(finderPatternGroup);

      // Founded alignment
      for (const alignmentPattern of alignmentPatterns) {
        detected.push(new Detect(matrix, finderPatternGroup, alignmentPattern));
      }
    }

    // No alignment version and fallback
    detected.push(new Detect(matrix, finderPatternGroup));
  }

  return detected;
}
