/**
 * @module PatternFinder
 */

import { Pattern } from './Pattern';
import { accumulate } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { PatternRatios } from './PatternRatios';
import { centerFromScanlineEnd, getDiagonalScanline } from './utils/scanline';
import { alignCrossPattern, calculatePatternNoise, isDiagonalScanlineCheckPassed } from './utils/pattern';

export class PatternFinder {
  #strict?: boolean;
  #matrix: BitMatrix;
  #ratios: PatternRatios;
  #patterns: Pattern[] = [];

  constructor(matrix: BitMatrix, ratios: PatternRatios, strict?: boolean) {
    this.#matrix = matrix;
    this.#ratios = ratios;
    this.#strict = strict;
  }

  public get matrix(): BitMatrix {
    return this.#matrix;
  }

  public get patterns(): Pattern[] {
    return this.#patterns;
  }

  protected match(x: number, y: number, scanline: number[], overscan: number): void {
    const matrix = this.#matrix;
    const ratios = this.#ratios;

    let centerX = centerFromScanlineEnd(scanline, x);

    const [centerY, vertical] = alignCrossPattern(matrix, centerX, y, overscan, ratios, true);

    if (centerY >= 0) {
      let horizontal: number[];

      // Re-horizontal check.
      [centerX, horizontal] = alignCrossPattern(matrix, centerX, centerY, overscan, ratios);

      if (centerX >= 0) {
        const slash = getDiagonalScanline(matrix, centerX, centerY, overscan);
        const backslash = getDiagonalScanline(matrix, centerX, centerY, overscan, true);

        if (isDiagonalScanlineCheckPassed(slash, backslash, ratios, this.#strict)) {
          const noise = calculatePatternNoise(ratios, horizontal, vertical, slash, backslash);
          const width = accumulate(horizontal);
          const height = accumulate(vertical);
          const patterns = this.#patterns;
          const { length } = patterns;

          let combined = false;

          for (let i = 0; i < length; i++) {
            const pattern = patterns[i];

            // Look for about the same center and module size.
            if (Pattern.equals(pattern, centerX, centerY, width, height)) {
              combined = true;
              patterns[i] = Pattern.combine(pattern, centerX, centerY, width, height, noise);
              break;
            }
          }

          // Hadn't found this before; save it.
          if (!combined) {
            patterns.push(new Pattern(ratios, centerX, centerY, width, height, noise));
          }
        }
      }
    }
  }
}

export interface MatchAction {
  (x: number, y: number, scanline: number[], count: number, scanlineBits: number[], lastBit: number): void;
}
