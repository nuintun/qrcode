/**
 * @module AlignmentPatternFinder
 */

import {
  centerFromEnd,
  crossPatternCheck,
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

  #isFoundPattern(stateCount: number[]): boolean {
    let moduleSize = this.#moduleSize;

    for (const count of stateCount) {
      if (!isEqualsModuleSize(count, moduleSize)) {
        return false;
      }
    }

    return isFoundAlignmentPattern(stateCount);
  }

  #crossCheckHorizontal(x: number, y: number, maxCount: number): number {
    const checker = this.#isFoundPattern.bind(this);

    return crossPatternCheck(this.#matrix, x, y, maxCount, true, checker);
  }

  #crossCheckVertical(x: number, y: number, maxCount: number): number {
    const checker = this.#isFoundPattern.bind(this);

    return crossPatternCheck(this.#matrix, x, y, maxCount, false, checker);
  }

  #process(patterns: Pattern[], x: number, y: number, stateCount: number[]): Pattern | undefined {
    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossCheckVertical(toInt32(offsetX), y, stateCount[2] * 2);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(toInt32(offsetX), toInt32(offsetY), stateCount[2] * 2);

      if (!Number.isNaN(offsetX)) {
        const moduleSize = getStateCountTotal(stateCount) / 5;

        for (const pattern of patterns) {
          // Look for about the same center and module size:
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            return pattern.combine(offsetX, offsetY, moduleSize);
          }
        }

        // Hadn't found this before; save it
        patterns.push(new Pattern(offsetX, offsetY, moduleSize));
      }
    }
  }

  public find(): Pattern | undefined {
    const startX = this.#x;
    const width = this.#width;
    const height = this.#height;
    const matrix = this.#matrix;
    const maxX = startX + width;
    const patterns: Pattern[] = [];
    const middleY = toInt32(this.#y + height / 2);

    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    for (let y = 0; y < height; y++) {
      let count = 0;
      let offsetX = startX;

      const stateCount = [0, 0, 0, 0, 0];
      const middle = toInt32((y + 1) / 2);
      // Search from middle outwards
      const offsetY = middleY + (y & 0x01 ? -middle : middle);

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (offsetX < maxX && !matrix.get(offsetX, offsetY)) {
        offsetX++;
      }

      let lastBit = matrix.get(offsetX, offsetY);

      while (offsetX < maxX) {
        const bit = matrix.get(offsetX, offsetY);

        if (bit === lastBit) {
          count++;
        } else {
          pushStateCount(stateCount, count);

          if (this.#isFoundPattern(stateCount)) {
            // Yes
            const confirmed = this.#process(patterns, offsetX, offsetY, stateCount);
            if (confirmed != null) {
              return confirmed;
            }
          }

          count = 1;
          lastBit = bit;
        }

        offsetX++;
      }

      pushStateCount(stateCount, count);

      if (this.#isFoundPattern(stateCount)) {
        const confirmed = this.#process(patterns, maxX, offsetY, stateCount);

        if (confirmed != null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    return patterns[0];
  }
}
