/**
 * @module matcher
 */

import { sumArray, toInt32 } from '/common/utils';
import { calculateScanlineNoise, sumScanlineNonzero } from './scanline';
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

  return toInt32(size2 - size1) <= size2 * ratio;
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
