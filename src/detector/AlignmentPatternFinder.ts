/**
 * @module AlignmentPatternFinder
 */

import { BitMatrix } from '/decoder/BitMatrix';
import { ResultPointCallback } from './ResultPoint';
import { AlignmentPattern } from './AlignmentPattern';

function centerFromEnd(stateCount: Int32Array, end: number): number {
  return end - stateCount[2] - stateCount[1] / 2.0;
}

export class AlignmentPatternFinder {
  private crossCheckStateCount: Int32Array;
  private possibleCenters: AlignmentPattern[];

  public constructor(
    private image: BitMatrix,
    private startX: number,
    private startY: number,
    private width: number,
    private height: number,
    private moduleSize: number,
    private resultPointCallback: ResultPointCallback
  ) {
    this.possibleCenters = [];
    this.crossCheckStateCount = new Int32Array(3);
  }

  private foundPatternCross(stateCount: Int32Array): boolean {
    const moduleSize = this.moduleSize;
    const maxVariance = moduleSize / 2.0;

    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }

    return true;
  }

  private crossCheckVertical(x: number, y: number, maxCount: number, originalStateCountTotal: number): number {
    const image = this.image;
    const maxY = this.height;
    const stateCount = this.crossCheckStateCount;

    stateCount[0] = 0;
    stateCount[1] = 0;
    stateCount[2] = 0;

    // Start counting up from center
    let i = y;

    while (i >= 0 && image.get(x, i) && stateCount[1] <= maxCount) {
      i--;
      stateCount[1]++;
    }

    // If already too many modules in this state or ran off the edge:
    if (i < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (i >= 0 && !image.get(x, i) && stateCount[0] <= maxCount) {
      i--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    i = y + 1;

    while (i < maxY && image.get(x, i) && stateCount[1] <= maxCount) {
      i++;
      stateCount[1]++;
    }

    if (i === maxY || stateCount[1] > maxCount) {
      return NaN;
    }

    while (i < maxY && !image.get(x, i) && stateCount[2] <= maxCount) {
      i++;
      stateCount[2]++;
    }

    if (stateCount[2] > maxCount) {
      return NaN;
    }

    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }

    return this.foundPatternCross(stateCount) ? centerFromEnd(stateCount, i) : NaN;
  }

  private handlePossibleCenter(stateCount: Int32Array, x: number, y: number): AlignmentPattern | null {
    const centerX = centerFromEnd(stateCount, x);
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
    const centerY = this.crossCheckVertical(centerX, y, 2 * stateCount[1], stateCountTotal);

    if (!Number.isNaN(centerY)) {
      const estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3.0;

      for (const center of this.possibleCenters) {
        // Look for about the same center and module size:
        if (center.aboutEquals(centerX, centerY, estimatedModuleSize)) {
          return center.combineEstimate(centerX, centerY, estimatedModuleSize);
        }
      }

      // Hadn't found this before; save it
      const point = new AlignmentPattern(centerX, centerY, estimatedModuleSize);

      this.possibleCenters.push(point);
      this.resultPointCallback.foundPossibleResultPoint(point);
    }

    return null;
  }

  public find(): AlignmentPattern | null {
    const { image, height, startX } = this;
    const maxX = this.width + startX;
    const centerY = this.startY + height / 2;

    // We are looking for black/white/black modules in 1:1:1 ratio
    // this tracks the number of black/white/black modules seen so far
    const stateCount = new Int32Array(3);

    for (let i = 0; i < height; i++) {
      let x = startX;
      let currentState = 0;
      // Search from middle outwards
      const y = centerY + ((i & 0x01) === 0 ? Math.floor((i + 1) / 2) : -Math.floor((i + 1) / 2));

      stateCount[0] = 0;
      stateCount[1] = 0;
      stateCount[2] = 0;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point
      while (x < maxX && !image.get(x, y)) {
        x++;
      }

      while (x < maxX) {
        if (image.get(x, y)) {
          // Black pixel
          if (currentState === 1) {
            // Counting black pixels
            stateCount[1]++;
          } else {
            // Counting white pixels
            if (currentState === 2) {
              // A winner?
              if (this.foundPatternCross(stateCount)) {
                // Yes
                const confirmed = this.handlePossibleCenter(stateCount, x, y);

                if (confirmed !== null) {
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

        x++;
      }

      if (this.foundPatternCross(stateCount)) {
        const confirmed = this.handlePossibleCenter(stateCount, maxX, y);

        if (confirmed !== null) {
          return confirmed;
        }
      }
    }

    // Hmm, nothing we saw was observed and confirmed twice. If we had
    // any guess at all, return it.
    if (this.possibleCenters.length !== 0) {
      return this.possibleCenters[0];
    }

    return null;
  }
}
