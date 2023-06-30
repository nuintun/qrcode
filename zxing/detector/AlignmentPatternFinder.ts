/**
 * @module AlignmentPatternFinder
 */

import { Pattern } from './Pattern';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';

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

  #isFoundPattern(stateCount: number[]): boolean {
    const moduleSize = this.#moduleSize;
    const moduleSizeDiff = moduleSize * 0.5;

    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= moduleSizeDiff) {
        return false;
      }
    }

    return true;
  }

  #crossCheck(x: number, y: number, maxCount: number, isHorizontal: boolean): number {
    const matrix = this.#matrix;
    const stateCount = [0, 0, 0];
    const getBit = (offset: number): number => {
      return isHorizontal ? matrix.get(offset, y) : matrix.get(x, offset);
    };

    let offset = isHorizontal ? x : y;

    // Start counting up from center
    while (offset >= 0 && getBit(offset) && stateCount[1] <= maxCount) {
      offset--;
      stateCount[1]++;
    }

    // If already too many modules in this state or ran off the edge
    if (offset < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offset >= 0 && !getBit(offset) && stateCount[0] <= maxCount) {
      offset--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    offset = (isHorizontal ? x : y) + 1;

    const size = isHorizontal ? this.#x + this.#width : this.#y + this.#height;

    while (offset < size && getBit(offset) && stateCount[1] <= maxCount) {
      offset++;
      stateCount[1]++;
    }

    if (offset === size || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offset < size && !getBit(offset) && stateCount[2] <= maxCount) {
      offset++;
      stateCount[2]++;
    }

    if (stateCount[2] > maxCount) {
      return NaN;
    }

    return this.#isFoundPattern(stateCount) ? centerFromEnd(stateCount, offset) : NaN;
  }

  #crossCheckHorizontal(x: number, y: number, maxCount: number): number {
    return this.#crossCheck(x, y, maxCount, true);
  }

  #crossCheckVertical(x: number, y: number, maxCount: number): number {
    return this.#crossCheck(x, y, maxCount, false);
  }

  #process(patterns: Pattern[], x: number, y: number, stateCount: number[]): Pattern | undefined {
    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossCheckVertical(toInt32(offsetX), y, stateCount[1] * 2);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(toInt32(offsetX), toInt32(offsetY), stateCount[1] * 2);

      if (!Number.isNaN(offsetX)) {
        const moduleSize = getStateCountTotal(stateCount) / 3;

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
    const middleY = this.#y + height / 2;

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
              if (this.#isFoundPattern(stateCount)) {
                // Yes
                const confirmed = this.#process(patterns, offsetX, offsetY, stateCount);

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
