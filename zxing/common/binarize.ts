// /**
//  * @module binarize
//  * @see https://github.com/FujiHaruka/node-adaptive-threshold
//  */

import { toInt32 } from './utils';
import { BitMatrix } from './BitMatrix';

function grayscale(colors: ArrayLike<number>, width: number, height: number): Float32Array {
  const pixels = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    const offset = y * width;

    for (let x = 0; x < width; x++) {
      const index = offset + x;
      const colorIndex = index * 4;
      const r = colors[colorIndex];
      const g = colors[colorIndex + 1];
      const b = colors[colorIndex + 2];

      pixels[index] = r * 0.2126 + g * 0.7152 + b * 0.0722;
    }
  }

  return pixels;
}

function calcLocalAverages(
  pixels: Float32Array,
  width: number,
  height: number,
  size: number
): [averages: Float32Array, width: number, height: number] {
  const sums: Float32Array[] = [];

  for (let y = 0; y < height; y++) {
    const offset = y * width;
    const sum = new Float32Array(width);

    for (let x = 0; x < size; x++) {
      sum[0] += pixels[offset + x];
    }

    for (let end = size; end < width; end++) {
      const start = end - size + 1;

      sum[start] = sum[start - 1] + pixels[offset + end] - pixels[offset + start - 1];
    }

    sums[y] = sum;
  }

  const averagesWidth = width - size + 1;
  const averagesHeight = height - size + 1;
  const averages = new Float32Array(averagesWidth * averagesHeight);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < averagesWidth; x++) {
      // Set x, 0
      averages[x] += sums[y][x];
    }
  }

  for (let y = 1; y < averagesHeight; y++) {
    const offset = y * averagesWidth;
    const prevOffset = offset - averagesWidth;

    for (let x = 0; x < averagesWidth; x++) {
      averages[offset + x] = averages[prevOffset + x] - sums[y - 1][x] + sums[y + size - 1][x];
    }
  }

  // Devide
  for (let y = 0; y < averagesHeight; y++) {
    const offset = y * averagesWidth;

    for (let x = 0; x < averagesWidth; x++) {
      averages[offset + x] /= size * size;
    }
  }

  return [averages, averagesWidth, averagesHeight];
}

export interface Options {
  size?: number;
  compensation?: number;
}

export function binarizer({ width, height, data }: ImageData, { size = 24, compensation = 8 }: Options = {}): BitMatrix {
  const middleSize = toInt32(size / 2);
  const binarized = new BitMatrix(width, height);
  const grayscaled = grayscale(data, width, height);
  const [averages, averagesWidth, averagesHeight] = calcLocalAverages(grayscaled, width, height, size);

  for (let y = 0; y < height; y++) {
    const offset = y * width;

    for (let x = 0; x < width; x++) {
      let averageX = x - middleSize;
      let averageY = y - middleSize;

      const pixel = grayscaled[offset + x];

      if (x - middleSize < 0) {
        averageX = 0;
      } else if (x - middleSize >= averagesWidth) {
        averageX = averagesWidth - 1;
      } else if (y - middleSize < 0) {
        averageY = 0;
      } else if (y - middleSize > averagesHeight) {
        averageY = averagesHeight - 1;
      }

      const average = averages[averageY * averagesWidth + averageX];

      if (pixel < average - compensation) {
        binarized.set(x, y);
      }
    }
  }

  return binarized;
}
