/**
 * @module PatternFinder
 */

import { Pattern } from './Pattern';
import { sumArray } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { calculatePatternNoise } from './utils/pattern';
import { centerFromScanlineEnd, getCrossScanline, getDiagonalScanline } from './utils/scanline';

export interface Matcher {
  (scanline: number[]): boolean;
}

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

  #isDiagonalPassed(slash: number[], backslash: number[]): boolean {
    const strict = this.#strict;
    const matcher = this.#matcher;

    if (matcher(slash)) {
      if (strict) {
        return matcher(backslash);
      }

      return true;
    }

    return false;
  }

  #alignCrossPattern(x: number, y: number, overscan: number, isVertical?: boolean): [center: number, scanline: number[]] {
    const [scanline, end] = getCrossScanline(this.#matrix, x, y, overscan, isVertical);

    return [this.#matcher(scanline) ? centerFromScanlineEnd(scanline, end) : NaN, scanline];
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
    if (this.#matcher(scanline)) {
      let horizontal: number[];
      let centerX = centerFromScanlineEnd(scanline, x);

      const [centerY, vertical] = this.#alignCrossPattern(centerX, y, overscan, true);

      if (centerY >= 0) {
        // Re-cross check
        [centerX, horizontal] = this.#alignCrossPattern(centerX, centerY, overscan);

        if (centerX >= 0) {
          const matrix = this.#matrix;
          const slash = getDiagonalScanline(matrix, centerX, centerY, overscan);
          const backslash = getDiagonalScanline(matrix, centerX, centerY, overscan, true);

          if (this.#isDiagonalPassed(slash, backslash)) {
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
