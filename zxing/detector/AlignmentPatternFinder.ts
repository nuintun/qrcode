/**
 * @module AlignmentPatternFinder
 */

import { BitMatrix } from '/common/BitMatrix';
import { AlignmentPattern } from './AlignmentPattern';

function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[2] - stateCount[1] / 2;
}

export class AlignmentPatternFinder {
  #x: number;
  #y: number;
  #matrix: BitMatrix;
  #moduleSize: number;
  #patterns: AlignmentPattern[] = [];

  constructor(matrix: BitMatrix, x: number, y: number, moduleSize: number) {
    this.#x = x;
    this.#y = y;
    this.#matrix = matrix;
    this.#moduleSize = moduleSize;
  }

  #foundPatternCross(stateCount: number[]): boolean {
    const moduleSize = this.#moduleSize;
    const maxVariance = Math.floor(moduleSize / 2);

    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }

    return true;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number, originalStateCountTotal: number): number {
    const matrix = this.#matrix;
    const stateCount = [0, 0, 0];

    let offsetY = y;

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

    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }

    return this.#foundPatternCross(stateCount) ? centerFromEnd(stateCount, offsetY) : NaN;
  }

  #handlePossibleCenter(x: number, y: number, stateCount: number[]): AlignmentPattern | null {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];

    const offsetX = centerFromEnd(stateCount, x);
    const offsetY = this.#crossCheckVertical(offsetX, y, 2 * stateCount[1], stateCountTotal);

    if (!Number.isNaN(offsetY)) {
      const patterns = this.#patterns;
      const moduleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3;

      for (const pattern of patterns) {
        // Look for about the same center and module size:
        if (pattern.equals(offsetX, offsetY, moduleSize)) {
          return pattern.combine(offsetX, offsetY, moduleSize);
        }
      }

      // Hadn't found this before; save it
      patterns.push(new AlignmentPattern(offsetX, offsetY, moduleSize));
    }

    return null;
  }

  public find(): AlignmentPattern {
    const startX = this.#x;
    const matrix = this.#matrix;
    const { width, height } = matrix;
    const maxX = startX + width;
    const middleY = this.#y + height / 2;

    // We are looking for black/white/black modules in 1:1:1 ratio;
    // this tracks the number of black/white/black modules seen so far
    for (let y = 0; y < height; y++) {
      let offsetX = startX;
      let currentState = 0;

      const stateCount = [0, 0, 0];
      // Search from middle outwards
      const offsetY = middleY + Math.floor((y & 0x01) === 0 ? (y + 1) / 2 : -((y + 1) / 2));

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
                const confirmed = this.#handlePossibleCenter(offsetX, offsetY, stateCount);

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
          if (currentState == 1) {
            // Counting black pixels
            currentState++;
          }

          stateCount[currentState]++;
        }

        offsetX++;
      }

      if (this.#foundPatternCross(stateCount)) {
        const confirmed = this.#handlePossibleCenter(maxX, offsetY, stateCount);

        if (confirmed != null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    const patterns = this.#patterns;

    if (patterns.length > 0) {
      return patterns[0];
    }

    throw new Error('no alignment pattern find');
  }
}