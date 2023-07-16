/**
 * @module matcher
 */

import { BitMatrix } from '/common/BitMatrix';
import { sumArray, toInt32 } from '/common/utils';
import { DIFF_ALIGNMENT_PATTERN_RATIO, DIFF_FINDER_PATTERN_RATIO } from './constants';
import { calculateScanlineNoise, centerFromScanlineEnd, getCrossScanline, sumScanlineNonzero } from './scanline';

export interface Matcher {
  (scanline: number[]): boolean;
}

export type PatternRect = readonly [
  // Left border center x
  left: number,
  // Top border center y
  top: number,
  // Right border center x
  right: number,
  // Bottom border center y
  bottom: number
];

export function isMatchFinderPattern(scanline: number[]): boolean {
  const modules = 7;
  const { length } = scanline;
  const scanlineTotal = sumScanlineNonzero(scanline);

  if (scanlineTotal >= modules) {
    const middleIndex = toInt32(length / 2);
    const moduleSize = scanlineTotal / modules;
    const threshold = moduleSize * DIFF_FINDER_PATTERN_RATIO;

    // Allow less than DIFF_FINDER_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
    for (let i = 0; i < length; i++) {
      const count = scanline[i];
      const ratio = i !== middleIndex ? 1 : 3;
      const moduleSizeDiff = Math.abs(count - moduleSize * ratio);

      if (moduleSizeDiff > threshold * ratio) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function isMatchAlignmentPattern(scanline: number[]): boolean {
  const modules = scanline.length;
  const scanlineTotal = sumScanlineNonzero(scanline);

  if (scanlineTotal >= modules) {
    const moduleSize = scanlineTotal / modules;
    const threshold = moduleSize * DIFF_ALIGNMENT_PATTERN_RATIO;

    // Allow less than DIFF_ALIGNMENT_MODULE_SIZE_RATIO variance from 1-1-1 or 1-1-1-1-1 proportions
    for (const count of scanline) {
      const moduleSizeDiff = Math.abs(count - moduleSize);

      if (moduleSizeDiff > threshold) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function isEqualsSize(size1: number, size2: number, ratio: number): boolean {
  if (size1 > size2) {
    [size1, size2] = [size2, size1];
  }

  return size2 - size1 <= size2 * ratio;
}

export function calculatePatternNoise(ratios: number[], ...scanlines: number[][]): number {
  const noises: number[] = [];
  const averages: number[] = [];
  const averagesDiff: number[] = [];

  // scanline length must be equals ratios length
  for (const scanline of scanlines) {
    const [noise, average] = calculateScanlineNoise(ratios, scanline);

    averages.push(average);
    noises.push(noise * noise);
  }

  const averagesAvg = sumArray(averages) / averages.length;

  for (const average of averages) {
    const diff = average - averagesAvg;

    averagesDiff.push(diff * diff);
  }

  return Math.sqrt(sumArray(noises)) + sumArray(averagesDiff) / averagesAvg;
}

export function isDiagonalScanlineCheckPassed(
  slash: number[],
  backslash: number[],
  matcher: Matcher,
  strict?: boolean
): boolean {
  if (matcher(slash)) {
    if (strict) {
      return matcher(backslash);
    }

    return true;
  }

  return false;
}

export function alignCrossPattern(
  matrix: BitMatrix,
  x: number,
  y: number,
  overscan: number,
  matcher: Matcher,
  isVertical?: boolean
): [center: number, scanline: number[]] {
  const [scanline, end] = getCrossScanline(matrix, x, y, overscan, isVertical);

  return [matcher(scanline) ? centerFromScanlineEnd(scanline, end) : NaN, scanline];
}
