/**
 * @module scanline
 */

import { sumArray, toInt32 } from '/common/utils';

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

export function centerFromEnd(scanline: number[], end: number): number {
  const { length } = scanline;
  const middleIndex = toInt32(length / 2);

  let center = end - scanline[middleIndex] / 2;

  for (let i = middleIndex + 1; i < length; i++) {
    center -= scanline[i];
  }

  return center;
}

export function calculateScanlineNoise(ratios: number[], scanline: number[]): [noise: number, average: number] {
  let noise = 0;

  const { length } = ratios;
  const average = sumArray(scanline) / sumArray(ratios);

  // scanline length must be equals ratios length
  for (let i = 0; i < length; i++) {
    const diff = scanline[i] - ratios[i] * average;

    noise += diff * diff;
  }

  return [noise, average];
}
