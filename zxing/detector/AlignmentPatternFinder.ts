/**
 * @module AlignmentPatternFinder
 */

import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { AlignmentPattern } from './AlignmentPattern';

function getStateCountTotal(stateCount: number[]): number {
  return stateCount[0] + stateCount[1] + stateCount[2];
}

function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[2] - stateCount[1] / 2;
}

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

  #foundPatternCross(stateCount: number[]): boolean {
    const moduleSize = this.#moduleSize;
    const maxVariance = moduleSize / 2;

    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }

    return true;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number, stateCountTotal: number): number {
    let offsetY = y;

    const matrix = this.#matrix;
    const stateCount = [0, 0, 0];

    // Start counting up from center
    while (offsetY >= 0 && matrix.get(x, offsetY) && stateCount[1] <= maxCount) {
      offsetY--;
      stateCount[1]++;
    }

    // If already too many modules in this state or ran off the edge
    if (offsetY < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offsetY >= 0 && !matrix.get(x, offsetY) && stateCount[0] <= maxCount) {
      offsetY--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    offsetY = y + 1;

    const { height } = matrix;

    while (offsetY < height && matrix.get(x, offsetY) && stateCount[1] <= maxCount) {
      offsetY++;
      stateCount[1]++;
    }

    if (offsetY === height || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offsetY < height && !matrix.get(x, offsetY) && stateCount[2] <= maxCount) {
      offsetY++;
      stateCount[2]++;
    }

    if (stateCount[2] > maxCount) {
      return NaN;
    }

    if (5 * Math.abs(getStateCountTotal(stateCount) - stateCountTotal) >= 2 * stateCountTotal) {
      return NaN;
    }

    return this.#foundPatternCross(stateCount) ? centerFromEnd(stateCount, offsetY) : NaN;
  }

  #handlePossiblePattern(patterns: AlignmentPattern[], x: number, y: number, stateCount: number[]): AlignmentPattern | void {
    const offsetX = centerFromEnd(stateCount, x);
    const stateCountTotal = getStateCountTotal(stateCount);
    const offsetY = this.#crossCheckVertical(offsetX, y, 2 * stateCount[1], stateCountTotal);

    if (!Number.isNaN(offsetY)) {
      const moduleSize = stateCountTotal / 3;

      for (const pattern of patterns) {
        // Look for about the same center and module size:
        if (pattern.equals(offsetX, offsetY, moduleSize)) {
          return pattern.combine(offsetX, offsetY, moduleSize);
        }
      }

      // Hadn't found this before; save it
      patterns.push(new AlignmentPattern(offsetX, offsetY, moduleSize));
    }
  }

  public find(): AlignmentPattern | undefined {
    const startX = this.#x;
    const width = this.#width;
    const height = this.#height;
    const matrix = this.#matrix;
    const maxX = startX + width;
    const middleY = this.#y + height / 2;
    const patterns: AlignmentPattern[] = [];

    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    for (let y = 0; y < height; y++) {
      let offsetX = startX;
      let currentState = 0;

      const stateCount = [0, 0, 0];
      const middle = toInt32((y + 1) / 2);
      // Search from middle outwards
      const offsetY = middleY + (y & 0x01 ? -middle : middle);

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (offsetX < maxX && !matrix.get(offsetX, offsetY)) {
        offsetX++;
      }

      while (offsetX < maxX) {
        if (matrix.get(offsetX, offsetY)) {
          // Black pixel
          if (currentState === 1) {
            // Counting black pixels
            stateCount[1]++;
          } else {
            // Counting white pixels
            if (currentState === 2) {
              // A winner?
              if (this.#foundPatternCross(stateCount)) {
                // Yes
                const confirmed = this.#handlePossiblePattern(patterns, offsetX, offsetY, stateCount);

                if (confirmed != null) {
                  return confirmed;
                }
              }

              stateCount[0] = stateCount[2];
              stateCount[1] = 1;
              stateCount[2] = 0;
              currentState = 1;
            } else {
              stateCount[++currentState]++;
            }
          }
        } else {
          // White pixel
          if (currentState === 1) {
            // Counting black pixels
            currentState++;
          }

          stateCount[currentState]++;
        }

        offsetX++;
      }

      if (this.#foundPatternCross(stateCount)) {
        const confirmed = this.#handlePossiblePattern(patterns, maxX, offsetY, stateCount);

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
