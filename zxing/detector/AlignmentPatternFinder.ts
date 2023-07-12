/**
 * @module AlignmentPatternFinder
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { PatternFinder } from './PatternFinder';
import { distance, Point } from '/common/Point';
import { scanlineUpdate } from './utils/scanline';
import { isEqualsSize, isMatchAlignmentPattern } from './utils/pattern';
import { ALIGNMENT_PATTERN_RATIOS, DIFF_MODULE_SIZE_RATIO } from './utils/constants';

export class AlignmentPatternFinder extends PatternFinder {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, ALIGNMENT_PATTERN_RATIOS, isMatchAlignmentPattern, strict);
  }

  public filter(expectAlignment: Point, moduleSize: number): Pattern[] {
    const patterns = this.patterns.filter(pattern => {
      const [xModuleSize, yModuleSize] = pattern.moduleSize;

      return (
        isEqualsSize(xModuleSize, moduleSize, DIFF_MODULE_SIZE_RATIO) &&
        isEqualsSize(yModuleSize, moduleSize, DIFF_MODULE_SIZE_RATIO)
      );
    });

    if (patterns.length > 1) {
      patterns.sort((pattern1, pattern2) => {
        const noise1 = distance(pattern1, expectAlignment) * pattern1.noise;
        const noise2 = distance(pattern2, expectAlignment) * pattern2.noise;

        return noise1 - noise2;
      });
    }

    // Only use the first two patterns
    return patterns.slice(0, 2);
  }

  public find(left: number, top: number, width: number, height: number): void {
    const { matrix } = this;
    const right = left + width;
    const bottom = top + height;
    const match = (x: number, y: number, lastBit: number, scanline: number[], count: number) => {
      scanlineUpdate(scanline, count);

      // Match pattern
      if (!lastBit) {
        this.match(x, y, scanline, scanline[1]);
      }
    };

    for (let y = top; y < bottom; y++) {
      let x = left;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < right && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const scanline = [0, 0, 0];

      while (x < right) {
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
  }
}
