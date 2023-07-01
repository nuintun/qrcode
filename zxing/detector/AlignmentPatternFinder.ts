/**
 * @module AlignmentPatternFinder
 */

import {
  alignCrossPattern,
  centerFromEnd,
  checkDiagonalPattern,
  getStateCountTotal,
  isEqualsModuleSize,
  isFoundAlignmentPattern,
  pushStateCount
} from './utils/finder';
import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';

export class AlignmentPatternFinder {
  #x: number;
  #y: number;
  #width: number;
  #height: number;
  #matrix: BitMatrix;
  #moduleSize: number;

  constructor(matrix: BitMatrix, x: number, y: number, width: number, height: number, moduleSize: number) {
    this.#x = x;
    this.#y = y;
    this.#width = width;
    this.#height = height;
    this.#matrix = matrix;
    this.#moduleSize = moduleSize;
  }

  #crossAlignHorizontal(x: number, y: number, moduleSize: number): number {
    return alignCrossPattern(this.#matrix, x, y, moduleSize, true, isFoundAlignmentPattern);
  }

  #crossAlignVertical(x: number, y: number, moduleSize: number): number {
    return alignCrossPattern(this.#matrix, x, y, moduleSize, false, isFoundAlignmentPattern);
  }

  #isDiagonalPassed(x: number, y: number, moduleSize: number, strict?: boolean): boolean {
    const matrix = this.#matrix;
    const isSlashPassed = checkDiagonalPattern(matrix, x, y, moduleSize, true, isFoundAlignmentPattern);

    if (strict) {
      return isSlashPassed && checkDiagonalPattern(matrix, x, y, moduleSize, false, isFoundAlignmentPattern);
    }

    return isSlashPassed || checkDiagonalPattern(matrix, x, y, moduleSize, false, isFoundAlignmentPattern);
  }

  #find(
    patterns: Pattern[],
    x: number,
    y: number,
    stateCount: number[],
    moduleSize: number,
    strict?: boolean
  ): Pattern | undefined {
    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossAlignVertical(toInt32(offsetX), y, moduleSize);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossAlignHorizontal(toInt32(offsetX), toInt32(offsetY), moduleSize);

      if (!Number.isNaN(offsetX) && this.#isDiagonalPassed(toInt32(offsetX), toInt32(offsetY), moduleSize, strict)) {
        for (const pattern of patterns) {
          // Look for about the same center and module size
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            return pattern.combine(offsetX, offsetY, moduleSize);
          }
        }

        // Hadn't found this before; save it
        patterns.push(new Pattern(offsetX, offsetY, moduleSize));
      }
    }
  }

  public find(strict?: boolean): Pattern | undefined {
    const startX = this.#x;
    const startY = this.#y;
    const matrix = this.#matrix;
    const patterns: Pattern[] = [];
    const width = startX + this.#width;
    const moduleSize = this.#moduleSize;
    const height = startY + this.#height;

    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    for (let y = startY; y < height; y++) {
      let x = startX;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < width && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const stateCount = [0, 0, 0];
      const process = (x: number, y: number) => {
        pushStateCount(stateCount, count);

        if (isFoundAlignmentPattern(stateCount)) {
          if (isEqualsModuleSize(moduleSize, getStateCountTotal(stateCount) / 3))
            return this.#find(patterns, x, y, stateCount, moduleSize, strict);
        }
      };

      while (x < width) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          // Yes
          const confirmed = process(x, y);

          if (confirmed != null) {
            return confirmed;
          }

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      const confirmed = process(x, y);

      if (confirmed != null) {
        return confirmed;
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    return patterns[0];
  }
}
