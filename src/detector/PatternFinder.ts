/**
 * @module PatternFinder
 */

import { Pattern } from './Pattern';
import { sumArray } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { centerFromScanlineEnd, getDiagonalScanline } from './utils/scanline';
import { alignCrossPattern, calculatePatternNoise, isDiagonalScanlineCheckPassed, Matcher } from './utils/pattern';

export class PatternFinder {
  #modules: number;
  #matcher: Matcher;
  #ratios: number[];
  #strict?: boolean;
  #matrix: BitMatrix;
  #patterns: Pattern[] = [];

  constructor(matrix: BitMatrix, ratios: number[], matcher: Matcher, strict?: boolean) {
    this.#matrix = matrix;
    this.#ratios = ratios;
    this.#strict = strict;
    this.#matcher = matcher;
    this.#modules = sumArray(ratios);
  }

  public get matcher(): Matcher {
    return this.#matcher;
  }

  public get matrix(): BitMatrix {
    return this.#matrix;
  }

  public get patterns(): Pattern[] {
    return this.#patterns;
  }

  protected match(x: number, y: number, scanline: number[], overscan: number): void {
    const matcher = this.#matcher;

    if (matcher(scanline)) {
      let horizontal: number[];
      let centerX = centerFromScanlineEnd(scanline, x);

      const matrix = this.#matrix;
      const [centerY, vertical] = alignCrossPattern(matrix, centerX, y, overscan, matcher, true);

      if (centerY >= 0) {
        // Re-horizontal check
        [centerX, horizontal] = alignCrossPattern(matrix, centerX, centerY, overscan, matcher);

        if (centerX >= 0) {
          const slash = getDiagonalScanline(matrix, centerX, centerY, overscan);
          const backslash = getDiagonalScanline(matrix, centerX, centerY, overscan, true);

          if (isDiagonalScanlineCheckPassed(slash, backslash, matcher, this.#strict)) {
            const noise = calculatePatternNoise(this.#ratios, horizontal, vertical, slash, backslash);
            const width = sumArray(horizontal);
            const height = sumArray(vertical);
            const patterns = this.#patterns;
            const { length } = patterns;

            let combined = false;

            for (let i = 0; i < length; i++) {
              const pattern = patterns[i];

              // Look for about the same center and module size
              if (pattern.equals(centerX, centerY, width, height)) {
                combined = true;
                patterns[i] = pattern.combine(centerX, centerY, width, height, noise);
                break;
              }
            }

            // Hadn't found this before; save it
            if (!combined) {
              patterns.push(new Pattern(centerX, centerY, width, height, this.#modules, noise));
            }
          }
        }
      }
    }
  }
}

export interface MatchAction {
  (x: number, y: number, scanline: number[], count: number, scanlineBits: number[], lastBit: number): void;
}
