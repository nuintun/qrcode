/**
 * @module FinderPatternFinder
 */

import { toInt32 } from '/common/utils';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPattern } from './FinderPattern';
import { FinderPatternGroup } from './FinderPatternGroup';

const MIN_SKIP = 3;
const MAX_MODULES = 97;
const CENTER_QUORUM = 2;
const DIFF_MODULE_SIZE_CUTOFF = 0.5;
const MIN_MODULE_COUNT_PER_EDGE = 9;
const MAX_MODULE_COUNT_PER_EDGE = 180;
const DIFF_MODULE_SIZE_CUTOFF_PERCENT = 0.05;

function shiftTwoCount(stateCount: number[]): void {
  stateCount[0] = stateCount[2];
  stateCount[1] = stateCount[3];
  stateCount[2] = stateCount[4];
  stateCount[3] = 1;
  stateCount[4] = 0;
}

function isFoundPattern(stateCount: number[], threshold: number): boolean {
  let totalModuleSize = 0;

  for (let i = 0; i < 5; i++) {
    const count = stateCount[i];

    if (count === 0) {
      return false;
    }

    totalModuleSize += count;
  }

  if (totalModuleSize < 7) {
    return false;
  }

  const moduleSize = totalModuleSize / 7;
  const maxVariance = moduleSize / threshold;

  // Allow less than 50% variance from 1-1-3-1-1 proportions
  return (
    Math.abs(moduleSize - stateCount[0]) < maxVariance &&
    Math.abs(moduleSize - stateCount[1]) < maxVariance &&
    Math.abs(3 * moduleSize - stateCount[2]) < 3 * maxVariance &&
    Math.abs(moduleSize - stateCount[3]) < maxVariance &&
    Math.abs(moduleSize - stateCount[4]) < maxVariance
  );
}

function foundPatternCross(stateCount: number[]): boolean {
  return isFoundPattern(stateCount, 2);
}

function foundPatternDiagonal(stateCount: number[]): boolean {
  return isFoundPattern(stateCount, 1.333);
}

function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[4] - stateCount[3] - stateCount[2] / 2;
}

function getStateCountTotal(stateCount: number[]): number {
  return stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
}

function isEqualsEdge(edge1: number, edge2: number): boolean {
  const percent = Math.abs(edge1 - edge2) / Math.min(edge1, edge2);

  return percent < 0.1;
}

function isEqualsModuleSize(pattern1: FinderPattern, pattern2: FinderPattern): boolean {
  const moduleSizeDiff = pattern1.moduleSize - pattern2.moduleSize;
  const moduleSizeDiffPercent = moduleSizeDiff / pattern2.moduleSize;

  if (moduleSizeDiff > DIFF_MODULE_SIZE_CUTOFF && moduleSizeDiffPercent >= DIFF_MODULE_SIZE_CUTOFF_PERCENT) {
    // break, since elements are ordered by the module size deviation there cannot be
    // any more interesting elements for the given p1.
    return false;
  }

  return true;
}

export class FinderPatternFinder {
  #matrix: BitMatrix;
  #hasSkipped: boolean = false;
  #patterns: FinderPattern[] = [];

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number, stateCountTotal: number): number {
    let offsetY = y;

    const matrix = this.#matrix;
    const { height } = matrix;
    const stateCount = [0, 0, 0, 0, 0];

    // Start counting up from center
    while (offsetY >= 0 && matrix.get(x, offsetY)) {
      offsetY--;
      stateCount[2]++;
    }

    if (offsetY < 0) {
      return NaN;
    }

    while (offsetY >= 0 && !matrix.get(x, offsetY) && stateCount[1] <= maxCount) {
      offsetY--;
      stateCount[1]++;
    }

    // If already too many modules in this state or ran off the edge:
    if (offsetY < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offsetY >= 0 && matrix.get(x, offsetY) && stateCount[0] <= maxCount) {
      offsetY--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    // Now also count down from center
    offsetY = y + 1;

    while (offsetY < height && matrix.get(x, offsetY)) {
      offsetY++;
      stateCount[2]++;
    }

    if (offsetY >= height) {
      return NaN;
    }

    while (offsetY < height && !matrix.get(x, offsetY) && stateCount[3] < maxCount) {
      offsetY++;
      stateCount[3]++;
    }

    if (offsetY >= height || stateCount[3] >= maxCount) {
      return NaN;
    }

    while (offsetY < height && matrix.get(x, offsetY) && stateCount[4] < maxCount) {
      offsetY++;
      stateCount[4]++;
    }

    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is more than 40% different than
    // the original, assume it's a false positive
    if (5 * Math.abs(getStateCountTotal(stateCount) - stateCountTotal) >= 2 * stateCountTotal) {
      return NaN;
    }

    return foundPatternCross(stateCount) ? centerFromEnd(stateCount, offsetY) : NaN;
  }

  #crossCheckHorizontal(x: number, y: number, maxCount: number, stateCountTotal: number): number {
    let offsetX = x;

    const matrix = this.#matrix;
    const { width } = matrix;
    const stateCount = [0, 0, 0, 0, 0];

    while (offsetX >= 0 && matrix.get(offsetX, y)) {
      offsetX--;
      stateCount[2]++;
    }

    if (offsetX < 0) {
      return NaN;
    }

    while (offsetX >= 0 && !matrix.get(offsetX, y) && stateCount[1] <= maxCount) {
      offsetX--;
      stateCount[1]++;
    }

    if (offsetX < 0 || stateCount[1] > maxCount) {
      return NaN;
    }

    while (offsetX >= 0 && matrix.get(offsetX, y) && stateCount[0] <= maxCount) {
      offsetX--;
      stateCount[0]++;
    }

    if (stateCount[0] > maxCount) {
      return NaN;
    }

    offsetX = x + 1;

    while (offsetX < width && matrix.get(offsetX, y)) {
      offsetX++;
      stateCount[2]++;
    }

    if (offsetX >= width) {
      return NaN;
    }

    while (offsetX < width && !matrix.get(offsetX, y) && stateCount[3] < maxCount) {
      offsetX++;
      stateCount[3]++;
    }

    if (offsetX >= width || stateCount[3] >= maxCount) {
      return NaN;
    }

    while (offsetX < width && matrix.get(offsetX, y) && stateCount[4] < maxCount) {
      offsetX++;
      stateCount[4]++;
    }

    if (stateCount[4] >= maxCount) {
      return NaN;
    }

    // If we found a finder-pattern-like section, but its size is significantly different than
    // the original, assume it's a false positive
    if (5 * Math.abs(getStateCountTotal(stateCount) - stateCountTotal) >= stateCountTotal) {
      return NaN;
    }

    return foundPatternCross(stateCount) ? centerFromEnd(stateCount, offsetX) : NaN;
  }

  #crossCheckDiagonal(x: number, y: number): boolean {
    let offset = 0;

    const matrix = this.#matrix;
    const stateCount = [0, 0, 0, 0, 0];

    // Start counting up, left from center finding black center mass
    while (x >= offset && y >= offset && matrix.get(x - offset, y - offset)) {
      offset++;
      stateCount[2]++;
    }

    if (stateCount[2] === 0) {
      return false;
    }

    // Continue up, left finding white space
    while (x >= offset && y >= offset && !matrix.get(x - offset, y - offset)) {
      offset++;
      stateCount[1]++;
    }

    if (stateCount[1] === 0) {
      return false;
    }

    // Continue up, left finding black border
    while (x >= offset && y >= offset && matrix.get(x - offset, y - offset)) {
      offset++;
      stateCount[0]++;
    }

    if (stateCount[0] === 0) {
      return false;
    }

    offset = 1;

    const { width, height } = matrix;

    while (x + offset < width && y + offset < height && matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[2]++;
    }

    while (x + offset < width && y + offset < height && !matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[3]++;
    }

    if (stateCount[3] === 0) {
      return false;
    }

    while (x + offset < width && y + offset < height && matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[4]++;
    }

    if (stateCount[4] === 0) {
      return false;
    }

    return foundPatternDiagonal(stateCount);
  }

  #handlePossibleCenter(x: number, y: number, stateCount: number[]): boolean {
    let offsetX = centerFromEnd(stateCount, x);

    const stateCountTotal = getStateCountTotal(stateCount);
    const offsetY = this.#crossCheckVertical(toInt32(offsetX), y, stateCount[2], stateCountTotal);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(toInt32(offsetX), toInt32(offsetY), stateCount[2], stateCountTotal);

      if (!Number.isNaN(offsetX) && this.#crossCheckDiagonal(toInt32(offsetX), toInt32(offsetY))) {
        let found = false;

        const patterns = this.#patterns;
        const { length } = patterns;
        const moduleSize = stateCountTotal / 7;

        for (let i = 0; i < length; i++) {
          const pattern = patterns[i];

          // Look for about the same center and module size:
          if (pattern.equals(offsetX, offsetY, moduleSize)) {
            found = true;
            patterns[i] = pattern.combine(offsetX, offsetY, moduleSize);
            break;
          }
        }

        if (!found) {
          patterns.push(new FinderPattern(offsetX, offsetY, moduleSize));
        }

        return true;
      }
    }

    return false;
  }

  #selectBestPatterns(): FinderPatternGroup[] {
    const patterns = this.#patterns;
    const { length } = patterns;

    // Couldn't find enough finder patterns
    if (length < 3) {
      return [];
    }

    // Begin HE modifications to safely detect multiple codes of equal size
    if (length === 3) {
      return [new FinderPatternGroup(patterns)];
    }

    // Max i1
    const maxI1 = length - 2;
    // Max i2
    const maxI2 = length - 1;
    // Groups
    const finderPatternGroups: FinderPatternGroup[] = [];

    // Sort patterns
    patterns.sort((pattern1, pattern2) => pattern2.moduleSize - pattern1.moduleSize);

    for (let i1 = 0; i1 < maxI1; i1++) {
      const pattern1 = patterns[i1];
      const moduleSizeDouble = pattern1.moduleSize * 2;

      for (let i2 = i1 + 1; i2 < maxI2; i2++) {
        const pattern2 = patterns[i2];

        if (!isEqualsModuleSize(pattern1, pattern2)) {
          break;
        }

        for (let i3 = i2 + 1; i3 < length; i3++) {
          const pattern3 = patterns[i3];

          if (!isEqualsModuleSize(pattern2, pattern3)) {
            break;
          }

          const finderPatternGroup = new FinderPatternGroup([pattern1, pattern2, pattern3]);
          const { topLeft, topRight, bottomLeft } = finderPatternGroup;
          const a = distance(topLeft, bottomLeft);
          const b = distance(topLeft, topRight);

          // Calculate the difference of the cathetus lengths in percent
          if (!isEqualsEdge(a, b)) {
            continue;
          }

          const c = distance(topRight, bottomLeft);

          // Calculate the difference of the hypotenuse lengths in percent
          if (!isEqualsEdge(Math.sqrt(a * a + b * b), c)) {
            continue;
          }

          // Check the sizes
          const moduleCount = (a + b) / moduleSizeDouble;

          if (moduleCount > MAX_MODULE_COUNT_PER_EDGE || moduleCount < MIN_MODULE_COUNT_PER_EDGE) {
            continue;
          }

          // All tests passed!
          finderPatternGroups.push(finderPatternGroup);
        }
      }
    }

    return finderPatternGroups;
  }

  #findRowSkip(): number {
    const patterns = this.#patterns;
    const { length } = patterns;

    if (length > 1) {
      let firstConfirmedCenter: FinderPattern | undefined;

      for (const pattern of patterns) {
        if (pattern.count >= CENTER_QUORUM) {
          if (firstConfirmedCenter == null) {
            firstConfirmedCenter = pattern;
          } else {
            // We have two confirmed centers
            // How far down can we skip before resuming looking for the next
            // pattern? In the worst case, only the difference between the
            // difference in the x / y coordinates of the two centers.
            // This is the case where you find top left last.
            this.#hasSkipped = true;

            const xDiff = Math.abs(firstConfirmedCenter.x - pattern.x);
            const yDiff = Math.abs(firstConfirmedCenter.y - pattern.y);

            return toInt32((xDiff - yDiff) / 2);
          }
        }
      }
    }

    return 0;
  }

  #haveMultiplyConfirmedCenters(): boolean {
    let confirmedCount = 0;
    let totalModuleSize = 0;

    const patterns = this.#patterns;
    const { length } = patterns;

    for (const pattern of patterns) {
      if (pattern.count >= CENTER_QUORUM) {
        confirmedCount++;
        totalModuleSize += pattern.moduleSize;
      }
    }

    if (confirmedCount < 3) {
      return false;
    }

    let totalDeviation = 0;

    const average = totalModuleSize / length;

    for (const pattern of patterns) {
      if (pattern.count >= CENTER_QUORUM) {
        totalDeviation += Math.abs(pattern.moduleSize - average);
      }
    }

    return totalDeviation <= 0.05 * totalModuleSize;
  }

  public find(harder?: boolean): FinderPatternGroup[] {
    let done = false;

    const matrix = this.#matrix;
    const { width, height } = matrix;

    // We are looking for black/white/black/white/black modules in
    // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far
    // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
    // image, and then account for the center being 3 modules in size. This gives the smallest
    // number of pixels the center could be, so skip this often. When trying harder, look for all
    // QR versions regardless of how dense they are.
    let skip = toInt32((3 * height) / (4 * MAX_MODULES));

    if (harder || skip < MIN_SKIP) {
      skip = MIN_SKIP;
    }

    for (let y = skip - 1; y < height && !done; y += skip) {
      let currentState = 0;

      const stateCount = [0, 0, 0, 0, 0];

      for (let x = 0; x < width; x++) {
        if (matrix.get(x, y)) {
          // Black pixel
          if (currentState & 0x01) {
            // Counting white pixels
            currentState++;
          }

          stateCount[currentState]++;
        } else {
          // White pixel
          if (!(currentState & 0x01)) {
            // Counting black pixels
            if (currentState === 4) {
              // A winner?
              if (foundPatternCross(stateCount)) {
                const confirmed = this.#handlePossibleCenter(x, y, stateCount);

                if (confirmed) {
                  // Start examining every other line. Checking each line turned out to be too
                  // expensive and didn't improve performance.
                  skip = 2;

                  if (this.#hasSkipped) {
                    done = this.#haveMultiplyConfirmedCenters();
                  } else {
                    const rowSkip = this.#findRowSkip();

                    if (rowSkip > stateCount[2]) {
                      // Skip rows between row of lower confirmed center
                      // and top of presumed third confirmed center
                      // but back up a bit to get a full chance of detecting
                      // it, entire width of center of finder pattern

                      // Skip by rowSkip, but back off by stateCount[2] (size of last center
                      // of pattern we saw) to be conservative, and also back off by iSkip which
                      // is about to be re-added
                      x = width - 1;
                      y += rowSkip - stateCount[2] - skip;
                    }
                  }
                }

                // Yes
                // Clear state to start looking again
                currentState = 0;

                stateCount.fill(0);
              } else {
                // No, shift counts back by two
                currentState = 3;

                shiftTwoCount(stateCount);
                continue;
              }

              // Clear state to start looking again
              currentState = 0;

              shiftTwoCount(stateCount);
            } else {
              stateCount[++currentState]++;
            }
          } else {
            // Counting white pixels
            stateCount[currentState]++;
          }
        }
      }

      if (foundPatternCross(stateCount)) {
        const confirmed = this.#handlePossibleCenter(width, y, stateCount);

        if (confirmed) {
          skip = stateCount[0];

          if (this.#hasSkipped) {
            // Found a third one
            done = this.#haveMultiplyConfirmedCenters();
          }
        }
      }
    }

    return this.#selectBestPatterns();
  }
}
