/**
 * @module AlignmentPatternFinder
 */

import { Pattern } from './Pattern';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { scanlineUpdate } from './utils/scanline';
import { DIFF_MODULE_SIZE_RATIO } from './utils/constants';
import { MatchAction, PatternFinder } from './PatternFinder';
import { isEqualsSize, isMatchPattern } from './utils/pattern';
import { ALIGNMENT_PATTERN_LOOSE_MODE_RATIOS, ALIGNMENT_PATTERN_RATIOS } from './PatternRatios';

export class AlignmentPatternFinder extends PatternFinder {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, ALIGNMENT_PATTERN_RATIOS, strict);
  }

  public filter(expectAlignment: Pattern, moduleSize: number): Pattern[] {
    const patterns = this.patterns.filter(pattern => {
      return Pattern.noise(pattern) <= 2.5 && isEqualsSize(pattern.moduleSize, moduleSize, DIFF_MODULE_SIZE_RATIO);
    });

    if (patterns.length > 1) {
      patterns.sort((pattern1, pattern2) => {
        const noise1 = Pattern.noise(pattern1);
        const noise2 = Pattern.noise(pattern2);
        const moduleSizeDiff1 = Math.abs(pattern1.moduleSize - moduleSize);
        const moduleSizeDiff2 = Math.abs(pattern2.moduleSize - moduleSize);
        const score1 = (distance(pattern1, expectAlignment) + moduleSizeDiff1) * noise1 * noise1;
        const score2 = (distance(pattern2, expectAlignment) + moduleSizeDiff2) * noise2 * noise2;

        return score1 - score2;
      });
    }

    // Only use the first two patterns
    const alignmentPatterns = patterns.slice(0, 2);

    // Add expect alignment for fallback
    alignmentPatterns.push(expectAlignment);

    return alignmentPatterns;
  }

  public find(left: number, top: number, width: number, height: number): void {
    const { matrix } = this;
    const right = left + width;
    const bottom = top + height;
    const match: MatchAction = (x, y, scanline, count, scanlineBits, lastBit) => {
      scanlineUpdate(scanline, count);
      scanlineUpdate(scanlineBits, lastBit);

      // Match pattern when white-black-white
      if (
        scanlineBits[0] === 0 &&
        scanlineBits[1] === 1 &&
        scanlineBits[2] === 0 &&
        isMatchPattern(scanline, ALIGNMENT_PATTERN_LOOSE_MODE_RATIOS)
      ) {
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
      const scanlineBits = [-1, -1, -1];

      while (x < right) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          match(x, y, scanline, count, scanlineBits, lastBit);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      match(x, y, scanline, count, scanlineBits, lastBit);
    }
  }
}
