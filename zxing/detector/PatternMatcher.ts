/**
 * @module PatternMatcher
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { centerFromEnd } from './utils/scanline';
import { sumArray, toInt32 } from '/common/utils';
import { alignCrossPattern, calculatePatternNoise, checkDiagonalPattern, getDiagonalScanline } from './utils/pattern';

export interface Matcher {
  (scanline: number[]): boolean;
}

export class PatternMatcher {
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

  #isDiagonalPassed(x: number, y: number, overscan: number): boolean {
    const matrix = this.#matrix;
    const strict = this.#strict;
    const matcher = this.#matcher;

    if (checkDiagonalPattern(matrix, x, y, overscan, matcher)) {
      if (strict) {
        return checkDiagonalPattern(matrix, x, y, overscan, matcher, true);
      }

      return true;
    }

    return false;
  }

  #alignVerticalPattern(x: number, y: number, overscan: number): ReturnType<typeof alignCrossPattern> {
    return alignCrossPattern(this.#matrix, x, y, overscan, this.#matcher, true);
  }

  #alignHorizontalPattern(x: number, y: number, overscan: number): ReturnType<typeof alignCrossPattern> {
    return alignCrossPattern(this.#matrix, x, y, overscan, this.#matcher);
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

  public match(x: number, y: number, scanline: number[], overscan: number): boolean {
    if (this.#matcher(scanline)) {
      let scanlineHorizontal;
      let offsetX = centerFromEnd(scanline, x);

      const [offsetY, scanlineVertical] = this.#alignVerticalPattern(toInt32(offsetX), y, overscan);

      if (offsetY >= 0) {
        // Re-cross check
        [offsetX, scanlineHorizontal] = this.#alignHorizontalPattern(toInt32(offsetX), toInt32(offsetY), overscan);

        if (offsetX >= 0 && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), overscan)) {
          const matrix = this.#matrix;
          // TODO 待优化
          const noise = calculatePatternNoise(
            this.#ratios,
            scanlineHorizontal,
            scanlineVertical,
            getDiagonalScanline(matrix, toInt32(offsetX), toInt32(offsetY), overscan),
            getDiagonalScanline(matrix, toInt32(offsetX), toInt32(offsetY), overscan, true)
          );
          const width = sumArray(scanlineHorizontal);
          const height = sumArray(scanlineVertical);
          const patterns = this.#patterns;
          const { length } = patterns;

          for (let i = 0; i < length; i++) {
            const pattern = patterns[i];

            // Look for about the same center and module size
            if (pattern.equals(offsetX, offsetY, width, height)) {
              patterns[i] = pattern.combine(offsetX, offsetY, width, height, noise);

              return true;
            }
          }

          // Hadn't found this before; save it
          patterns.push(new Pattern(offsetX, offsetY, width, height, this.#modules, noise));

          return true;
        }
      }
    }

    return false;
  }
}
