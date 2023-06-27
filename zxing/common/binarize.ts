/**
 * @module binarize
 */

import { BitMatrix } from './BitMatrix';

const MIN_LUMINANCE_VALUE = 0;
const MAX_LUMINANCE_VALUE = 255;

function convertGreyscale({ width, height, data }: ImageData): Uint8Array {
  const luminance = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const point = x * 4 + y * width * 4;
      const r = data[point];
      const g = data[point + 1];
      const b = data[point + 2];

      luminance[x + y * width] = Math.floor((r * 33 + g * 34 + b * 33) / 100);
    }
  }

  return luminance;
}

function calculateThreshold(luminance: Uint8Array): number {
  let max = 0;
  let threshold = 0;

  const histogram: number[] = [];

  for (let i = MIN_LUMINANCE_VALUE; i <= MAX_LUMINANCE_VALUE; i++) {
    histogram[i] = 0;
  }

  for (const value of luminance) {
    histogram[value]++;
  }

  for (let i = 0; i <= MAX_LUMINANCE_VALUE; ++i) {
    const black = { sum: 0, pixels: 0, average: 0 };
    const white = { sum: 0, pixels: 0, average: 0 };

    for (let j = MIN_LUMINANCE_VALUE; j <= i; ++j) {
      black.pixels += histogram[j];
      black.sum += j * histogram[j];
    }

    for (let j = i + 1; j <= MAX_LUMINANCE_VALUE; ++j) {
      white.pixels += histogram[j];
      white.sum += j * histogram[j];
    }

    if (black.pixels) {
      black.average = black.sum / black.pixels;
    }

    if (white.pixels) {
      white.average = white.sum / white.pixels;
    }

    const value = black.pixels * white.pixels * Math.pow(black.average - white.average, 2);

    if (max < value) {
      max = value;
      threshold = i;
    }
  }

  return threshold;
}

export function binarize(imageData: ImageData, width: number, height: number): BitMatrix {
  const matrix = new BitMatrix(width, height);
  const luminance = convertGreyscale(imageData);
  const threshold = calculateThreshold(luminance);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = luminance[x + y * width];

      if (value <= threshold) {
        matrix.set(x, y);
      }
    }
  }

  return matrix;
}
