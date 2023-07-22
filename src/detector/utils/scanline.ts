/**
 * @module scanline
 */

import { BitMatrix } from '/common/BitMatrix';
import { accumulate, toInt32 } from '/common/utils';
import { PatternRatios } from '/detector/PatternRatios';

export function calculateScanlineNoise(
  scanline: number[],
  { ratios, modules }: PatternRatios
): [noise: number, average: number] {
  let noise = 0;

  const { length } = ratios;
  const total = accumulate(scanline);
  const average = total / modules;

  // scanline length must be equals ratios length
  for (let i = 0; i < length; i++) {
    noise += Math.abs(scanline[i] - ratios[i] * average);
  }

  return [noise / total, average];
}

export function sumScanlineNonzero(scanline: number[]): number {
  let scanlineTotal = 0;

  for (const count of scanline) {
    if (count === 0) {
      return NaN;
    }

    scanlineTotal += count;
  }

  return scanlineTotal;
}

export function scanlineUpdate(scanline: number[], count: number): void {
  const { length } = scanline;
  const lastIndex = length - 1;

  for (let i = 0; i < lastIndex; i++) {
    scanline[i] = scanline[i + 1];
  }

  scanline[lastIndex] = count;
}

export function getCrossScanline(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  isVertical?: boolean
): [scanline: number[], end: number] {
  x = toInt32(x);
  y = toInt32(y);

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

  return [scanline, offset];
}

export function getDiagonalScanline(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  isBackslash?: boolean
): number[] {
  x = toInt32(x);
  y = toInt32(y);

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

// @see https://github.com/zxing-cpp/zxing-cpp/blob/master/core/src/ConcentricFinder.h
export function centerFromScanlineEnd(scanline: number[], end: number): number {
  const { length } = scanline;
  const maxIndex = length - 1;
  const centers: number[] = [];
  const middleIndex = toInt32(scanline.length / 2);

  for (let i = 0; i <= middleIndex; i++) {
    const splitIndex = middleIndex + i;

    centers.push(accumulate(scanline, middleIndex - i, splitIndex) / 2 + accumulate(scanline, splitIndex + 1, maxIndex));
  }

  return end - (centers[0] * 2 + accumulate(centers, 1)) / (middleIndex + 2);
}
