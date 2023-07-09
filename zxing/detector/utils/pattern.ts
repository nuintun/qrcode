/**
 * @module matcher
 */

import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';

export const DIFF_EDGE_RATIO = 0.5;
export const DIFF_MODULE_SIZE_RATIO = 1;
export const DIFF_FINDER_PATTERN_RATIO = 0.5;
export const DIFF_ALIGNMENT_PATTERN_RATIO = 0.8;

export function centerFromEnd(scanline: number[], end: number): number {
  const { length } = scanline;
  const middleIndex = toInt32(length / 2);

  let center = end - scanline[middleIndex] / 2;

  for (let i = middleIndex + 1; i < length; i++) {
    center -= scanline[i];
  }

  return center;
}

export function scanlineUpdate(scanline: number[], count: number): void {
  const { length } = scanline;
  const lastIndex = length - 1;

  for (let i = 0; i < lastIndex; i++) {
    scanline[i] = scanline[i + 1];
  }

  scanline[lastIndex] = count;
}

export function calculateScanlineTotal(scanline: number[], checkZero?: boolean): number {
  let scanlineTotal = 0;

  for (const count of scanline) {
    if (checkZero && count === 0) {
      return NaN;
    }

    scanlineTotal += count;
  }

  return scanlineTotal;
}

export function isMatchFinderPattern(scanline: number[]): boolean {
  const modules = 7;
  const { length } = scanline;
  const scanlineTotal = calculateScanlineTotal(scanline, true);

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
  const scanlineTotal = calculateScanlineTotal(scanline, true);

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

export function isEqualsEdge(edge1: number, edge2: number): boolean {
  const edgeAvg = (edge1 + edge2) / 2;
  const ratio = Math.abs(edge1 - edge2) / edgeAvg;

  return ratio < DIFF_EDGE_RATIO;
}

export function isEqualsModuleSize(moduleSize1: number, moduleSize2: number): boolean {
  const moduleSize = (moduleSize1 + moduleSize2) / 2;
  const moduleSizeDiff = moduleSize * DIFF_MODULE_SIZE_RATIO;

  return Math.abs(moduleSize1 - moduleSize2) <= moduleSizeDiff;
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
