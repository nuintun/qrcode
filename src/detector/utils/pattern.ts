/**
 * @module matcher
 */

import { sumArray } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { PatternRatios } from '/detector/PatternRatios';
import { DIFF_PATTERN_ALLOWANCE_SIZE, DIFF_PATTERN_RATIO } from './constants';
import { calculateScanlineNoise, centerFromScanlineEnd, getCrossScanline, sumScanlineNonzero } from './scanline';

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

export function isDiagonalScanlineCheckPassed(
  slash: number[],
  backslash: number[],
  ratios: PatternRatios,
  strict?: boolean
): boolean {
  if (isMatchPattern(slash, ratios)) {
    if (strict) {
      return isMatchPattern(backslash, ratios);
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
  ratios: PatternRatios,
  isVertical?: boolean
): [center: number, scanline: number[]] {
  const [scanline, end] = getCrossScanline(matrix, x, y, overscan, isVertical);

  return [isMatchPattern(scanline, ratios) ? centerFromScanlineEnd(scanline, end) : NaN, scanline];
}

export function isEqualsSize(size1: number, size2: number, ratio: number): boolean {
  if (size1 > size2) {
    [size1, size2] = [size2, size1];
  }

  return size2 - size1 <= size2 * ratio;
}

export function isMatchPattern(scanline: number[], { ratios, modules }: PatternRatios): boolean {
  const { length } = scanline;
  const scanlineTotal = sumScanlineNonzero(scanline);

  if (scanlineTotal >= modules) {
    const moduleSize = scanlineTotal / modules;
    const threshold = moduleSize * DIFF_PATTERN_RATIO + DIFF_PATTERN_ALLOWANCE_SIZE;

    // Allow less than DIFF_FINDER_MODULE_SIZE_RATIO variance from 1-1-3-1-1 proportions
    for (let i = 0; i < length; i++) {
      const ratio = ratios[i];
      const count = scanline[i];
      const moduleSizeDiff = Math.abs(count - moduleSize * ratio);

      if (moduleSizeDiff > threshold) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function calculatePatternNoise(ratios: PatternRatios, ...scanlines: number[][]): number {
  const noises: number[] = [];
  const averages: number[] = [];
  const averagesDiff: number[] = [];

  // scanline length must be equals ratios length
  for (const scanline of scanlines) {
    const [noise, average] = calculateScanlineNoise(scanline, ratios);

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
