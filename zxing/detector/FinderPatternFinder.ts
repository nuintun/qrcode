/**
 * @module FinderPatternFinder
 */

import { BitMatrix } from '/common/BitMatrix';
import { FinderPattern } from './FinderPattern';
import { distance, FinderPatternInfo } from './FinderPatternInfo';

const MIN_SKIP = 3;
const MAX_MODULES = 97;
const DIFF_MODSIZE_CUTOFF = 0.5;
const MIN_MODULE_COUNT_PER_EDGE = 9;
const MAX_MODULE_COUNT_PER_EDGE = 180;
const DIFF_MODSIZE_CUTOFF_PERCENT = 0.05;

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
  return end - stateCount[4] - stateCount[3] - stateCount[2] / 2.0;
}

export class FinderPatternFinder {
  #matrix: BitMatrix;
  #patterns: FinderPattern[] = [];

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number, originalStateCountTotal: number): number {
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

    if (offsetY === height) {
      return NaN;
    }

    while (offsetY < height && !matrix.get(x, offsetY) && stateCount[3] < maxCount) {
      offsetY++;
      stateCount[3]++;
    }

    if (offsetY === height || stateCount[3] >= maxCount) {
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
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
      return NaN;
    }

    return foundPatternCross(stateCount) ? centerFromEnd(stateCount, offsetY) : NaN;
  }

  #crossCheckHorizontal(x: number, y: number, maxCount: number, originalStateCountTotal: number): number {
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

    if (offsetX === width) {
      return NaN;
    }

    while (offsetX < width && !matrix.get(offsetX, y) && stateCount[3] < maxCount) {
      offsetX++;
      stateCount[3]++;
    }

    if (offsetX === width || stateCount[3] >= maxCount) {
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
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

    if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
      return NaN;
    }

    return foundPatternCross(stateCount) ? centerFromEnd(stateCount, y) : NaN;
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

    if (stateCount[3] == 0) {
      return false;
    }

    while (x + offset < width && y + offset < height && matrix.get(x + offset, y + offset)) {
      offset++;
      stateCount[4]++;
    }

    if (stateCount[4] == 0) {
      return false;
    }

    return foundPatternDiagonal(stateCount);
  }

  #handlePossibleCenter(x: number, y: number, stateCount: number[]): boolean {
    const stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];

    let offsetX = centerFromEnd(stateCount, x);

    const offsetY = this.#crossCheckVertical(x, offsetX, stateCount[2], stateCountTotal);

    if (!Number.isNaN(offsetY)) {
      // Re-cross check
      offsetX = this.#crossCheckHorizontal(x, y, stateCount[2], stateCountTotal);

      if (!Number.isNaN(offsetX) && this.#crossCheckDiagonal(offsetX, offsetY)) {
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

  #selectBestPatterns(): FinderPatternInfo[] {
    const patterns = this.#patterns.filter(pattern => pattern.count >= 2);
    const { length } = patterns;

    // Couldn't find enough finder patterns
    if (length < 3) {
      throw new Error('no finder patterns found');
    }

    // Begin HE modifications to safely detect multiple codes of equal size
    if (length === 3) {
      return [new FinderPatternInfo(patterns)];
    }

    const finderPatterns: FinderPatternInfo[] = [];

    patterns.sort((pattern1, pattern2) => pattern2.moduleSize - pattern1.moduleSize);

    for (let i1 = 0; i1 < length - 2; i1++) {
      const pattern1 = patterns[i1];

      if (pattern1 == null) {
        continue;
      }

      for (let i2 = i1 + 1; i2 < length - 1; i2++) {
        const pattern2 = patterns[i2];

        if (pattern2 == null) {
          continue;
        }

        const vModSize12A = pattern1.moduleSize - pattern2.moduleSize;
        const vModSize12 = vModSize12A / pattern2.moduleSize;

        if (vModSize12A > DIFF_MODSIZE_CUTOFF && vModSize12 >= DIFF_MODSIZE_CUTOFF_PERCENT) {
          // break, since elements are ordered by the module size deviation there cannot be
          // any more interesting elements for the given p1.
          break;
        }

        for (let i3 = i2 + 1; i3 < length; i3++) {
          const pattern3 = patterns[i3];

          if (pattern3 == null) {
            continue;
          }

          const vModSize23A = pattern2.moduleSize - pattern3.moduleSize;
          const vModSize23 = vModSize23A / pattern3.moduleSize;

          if (vModSize23A > DIFF_MODSIZE_CUTOFF && vModSize23 >= DIFF_MODSIZE_CUTOFF_PERCENT) {
            // break, since elements are ordered by the module size deviation there cannot be
            // any more interesting elements for the given p1.
            break;
          }

          const finder = new FinderPatternInfo([pattern1, pattern2, pattern3]);
          const { topLeft, topRight, bottomLeft } = finder;
          const dA = distance(topLeft, bottomLeft);
          const dC = distance(topRight, bottomLeft);
          const dB = distance(topLeft, topRight);
          // Check the sizes
          const moduleCount = (dA + dB) / (pattern1.moduleSize * 2);

          if (moduleCount > MAX_MODULE_COUNT_PER_EDGE || moduleCount < MIN_MODULE_COUNT_PER_EDGE) {
            continue;
          }

          // Calculate the difference of the edge lengths in percent
          const vABBC = Math.abs((dA - dB) / Math.min(dA, dB));

          if (vABBC >= 0.1) {
            continue;
          }

          // Calculate the diagonal length by assuming a 90° angle at topleft
          const dCpy = Math.sqrt(dA * dA + dB * dB);
          // Compare to the real distance in %
          const vPyC = Math.abs((dC - dCpy) / Math.min(dC, dCpy));

          if (vPyC >= 0.1) {
            continue;
          }

          // All tests passed!
          finderPatterns.push(finder);
        }
      }
    }

    return finderPatterns;
  }

  public find(): FinderPatternInfo[] {
    const matrix = this.#matrix;
    const { width, height } = matrix;
    // We are looking for black/white/black/white/black modules in
    // 1:1:3:1:1 ratio; this tracks the number of such modules seen so far
    // Let's assume that the maximum version QR Code we support takes up 1/4 the height of the
    // image, and then account for the center being 3 modules in size. This gives the smallest
    // number of pixels the center could be, so skip this often. When trying harder, look for all
    // QR versions regardless of how dense they are.
    const skip = Math.max(MIN_SKIP, Math.floor((3 * height) / (4 * MAX_MODULES)));

    for (let y = skip - 1; y < height; y += skip) {
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
              if (foundPatternCross(stateCount) && this.#handlePossibleCenter(x, y, stateCount)) {
                // Yes
                // Clear state to start looking again
                currentState = 0;

                stateCount.fill(0);
              } else {
                // No, shift counts back by two
                currentState = 3;

                shiftTwoCount(stateCount);
              }
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
        this.#handlePossibleCenter(width, y, stateCount);
      }
    }

    return this.#selectBestPatterns();
  }
}
