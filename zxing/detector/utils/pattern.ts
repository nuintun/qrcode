/**
 * @module matcher
 */

import { sumArray, toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { calculateScanlineNoise, centerFromEnd, sumScanlineNonzero } from './scanline';
import { DIFF_ALIGNMENT_PATTERN_RATIO, DIFF_FINDER_PATTERN_RATIO } from './constants';

export function isMatchFinderPattern(scanline: number[]): boolean {
  const modules = 7;
  const { length } = scanline;
  const scanlineTotal = sumScanlineNonzero(scanline);

  if (scanlineTotal >= modules) {
    const moduleSize = scanlineTotal / modules;

    if (moduleSize >= 1) {
      const middleIndex = toInt32(length / 2);
      const threshold = moduleSize * DIFF_FINDER_PATTERN_RATIO;

      // Allow less than DIFF_FINDER_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
      for (let i = 0; i < length; i++) {
        const count = scanline[i];
        const ratio = i !== middleIndex ? 1 : 3;
        const moduleSizeDiff = Math.abs(count - moduleSize * ratio);

        if (moduleSizeDiff > 1 && moduleSizeDiff > threshold * ratio) {
          return false;
        }
      }

      return true;
    }
  }

  return false;
}

export function isMatchAlignmentPattern(scanline: number[]): boolean {
  const modules = scanline.length;
  const scanlineTotal = sumScanlineNonzero(scanline);

  if (scanlineTotal >= modules) {
    const moduleSize = scanlineTotal / modules;

    if (moduleSize >= 1) {
      const threshold = moduleSize * DIFF_ALIGNMENT_PATTERN_RATIO;

      // Allow less than DIFF_ALIGNMENT_MODULE_SIZE_RATIO variance from 1-1-1 or 1-1-1-1-1 proportions
      for (const count of scanline) {
        const moduleSizeDiff = Math.abs(count - moduleSize);

        if (moduleSizeDiff > 1 && moduleSizeDiff > threshold) {
          return false;
        }
      }

      return true;
    }
  }

  return false;
}

export function isEqualsSize(size1: number, size2: number, ratio: number): boolean {
  if (size1 > size2) {
    [size1, size2] = [size2, size1];
  }

  return size2 - size1 <= size2 * ratio;
}

export function alignCrossPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  checker: (scanline: number[]) => boolean,
  isVertical?: boolean
): [offset: number, scanline: number[]] {
  let offset = isVertical ? y : x;

  const scanline = [0, 0, 0, 0, 0];
  const size = isVertical ? matrix.height : matrix.width;
  const isBlackPixel = (): number => {
    return isVertical ? matrix.get(x, offset) : matrix.get(offset, y);
  };

  while (offset >= 0 && isBlackPixel()) {
    offset--;
    scanline[2]++;
  }

  while (offset >= 0 && !isBlackPixel()) {
    offset--;
    scanline[1]++;
  }

  while (offset >= 0 && scanline[0] < overscan && isBlackPixel()) {
    offset--;
    scanline[0]++;
  }

  offset = (isVertical ? y : x) + 1;

  while (offset < size && isBlackPixel()) {
    offset++;
    scanline[2]++;
  }

  while (offset < size && !isBlackPixel()) {
    offset++;
    scanline[3]++;
  }

  while (offset < size && scanline[4] < overscan && isBlackPixel()) {
    offset++;
    scanline[4]++;
  }

  return [checker(scanline) ? centerFromEnd(scanline, offset) : NaN, scanline];
}

export function checkDiagonalPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  checker: (scanline: number[]) => boolean,
  isBackslash?: boolean
): boolean {
  let step = -1;
  let offsetX = x;
  let offsetY = y;

  const scanline = [0, 0, 0, 0, 0];
  const { width, height } = matrix;
  const slope = isBackslash ? -1 : 1;
  const updateAxis = (): void => {
    offsetX += step;
    offsetY -= step * slope;
  };
  const isBlackPixel = (): number => {
    return matrix.get(offsetX, offsetY);
  };

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && isBlackPixel()) {
    updateAxis();

    scanline[2]++;
  }

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
    updateAxis();

    scanline[1]++;
  }

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && scanline[0] < overscan && isBlackPixel()) {
    updateAxis();

    scanline[0]++;
  }

  step = 1;
  offsetX = x + step;
  offsetY = y - step * slope;

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && isBlackPixel()) {
    updateAxis();

    scanline[2]++;
  }

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
    updateAxis();

    scanline[3]++;
  }

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && scanline[4] < overscan && isBlackPixel()) {
    updateAxis();

    scanline[4]++;
  }

  return checker(scanline);
}

export function getDiagonalScanline(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  isBackslash?: boolean
): number[] {
  let step = -1;
  let offsetX = x;
  let offsetY = y;

  const scanline = [0, 0, 0, 0, 0];
  const { width, height } = matrix;
  const slope = isBackslash ? -1 : 1;
  const updateAxis = (): void => {
    offsetX += step;
    offsetY -= step * slope;
  };
  const isBlackPixel = (): number => {
    return matrix.get(offsetX, offsetY);
  };

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && isBlackPixel()) {
    updateAxis();

    scanline[2]++;
  }

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
    updateAxis();

    scanline[1]++;
  }

  // Start counting left from center finding black center mass
  while (offsetX >= 0 && offsetY >= 0 && offsetY < height && scanline[0] < overscan && isBlackPixel()) {
    updateAxis();

    scanline[0]++;
  }

  step = 1;
  offsetX = x + step;
  offsetY = y - step * slope;

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && isBlackPixel()) {
    updateAxis();

    scanline[2]++;
  }

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && !isBlackPixel()) {
    updateAxis();

    scanline[3]++;
  }

  // Start counting right from center finding black center mass
  while (offsetX < width && offsetY >= 0 && offsetY < height && scanline[4] < overscan && isBlackPixel()) {
    updateAxis();

    scanline[4]++;
  }

  return scanline;
}

export function calculatePatternNoise(ratios: number[], ...scanlines: number[][]): number {
  const noises: number[] = [];
  const averages: number[] = [];
  const averagesDiff: number[] = [];

  for (const scanline of scanlines) {
    const [noise, average] = calculateScanlineNoise(scanline, ratios);

    noises.push(noise);
    averages.push(average);
  }

  const averagesAvg = sumArray(averages) / averages.length;

  for (const average of averages) {
    const diff = average - averagesAvg;

    averagesDiff.push(diff * diff);
  }

  return sumArray(noises) + sumArray(averagesDiff) / averagesAvg;
}
