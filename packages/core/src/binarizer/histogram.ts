/**
 * @module histogram
 */

import { toUint32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';

const LUMINANCE_BITS = 5;
const LUMINANCE_SHIFT = 8 - LUMINANCE_BITS;
const LUMINANCE_BUCKETS = 1 << LUMINANCE_BITS;

function calculateBlackPoint(buckets: Int32Array): number {
  let firstPeak = 0;
  let firstPeakSize = 0;
  let maxBucketCount = 0;

  // Find the tallest peak in the histogram.
  const { length } = buckets;

  for (let x = 0; x < length; x++) {
    if (buckets[x] > firstPeakSize) {
      firstPeak = x;
      firstPeakSize = buckets[x];
    }

    if (buckets[x] > maxBucketCount) {
      maxBucketCount = buckets[x];
    }
  }

  // Find the second-tallest peak which is somewhat far from the tallest peak.
  let secondPeak = 0;
  let secondPeakScore = 0;

  for (let x = 0; x < length; x++) {
    const distanceToBiggest = x - firstPeak;
    // Encourage more distant second peaks by multiplying by square of distance.
    const score = buckets[x] * distanceToBiggest * distanceToBiggest;

    if (score > secondPeakScore) {
      secondPeak = x;
      secondPeakScore = score;
    }
  }

  // Make sure firstPeak corresponds to the black peak.
  if (firstPeak > secondPeak) {
    [firstPeak, secondPeak] = [secondPeak, firstPeak];
  }

  // If there is too little contrast in the image to pick a meaningful black point, throw rather
  // than waste time trying to decode the image, and risk false positives.
  if (secondPeak - firstPeak <= LUMINANCE_BUCKETS / 16) {
    return -1;
  }

  // Find a valley between them that is low and closer to the white peak.
  let bestValleyScore = -1;
  let bestValley = secondPeak - 1;

  for (let x = secondPeak - 1; x > firstPeak; x--) {
    const fromFirst = x - firstPeak;
    const score = fromFirst * fromFirst * (secondPeak - x) * (maxBucketCount - buckets[x]);

    if (score > bestValleyScore) {
      bestValley = x;
      bestValleyScore = score;
    }
  }

  return bestValley << LUMINANCE_SHIFT;
}

export function histogram(luminances: Uint8Array, width: number, height: number): BitMatrix {
  const leftX = toUint32(width / 5);
  const rightX = toUint32((width * 4) / 5);
  const matrix = new BitMatrix(width, height);
  const buckets = new Int32Array(LUMINANCE_BUCKETS);

  for (let y = 1; y < 5; y++) {
    const offset = toUint32((height * y) / 5) * width;

    for (let x = leftX; x < rightX; x++) {
      const pixel = luminances[offset + x];

      buckets[pixel >> LUMINANCE_SHIFT]++;
    }
  }

  const blackPoint = calculateBlackPoint(buckets);

  // We delay reading the entire image luminance until the black point estimation succeeds.
  // Although we end up reading four rows twice, it is consistent with our motto of
  // "fail quickly" which is necessary for continuous scanning.
  if (blackPoint > 0) {
    let offset = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (luminances[offset + x] < blackPoint) {
          matrix.set(x, y);
        }
      }

      offset += width;
    }
  }

  return matrix;
}
