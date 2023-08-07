/**
 * @module index
 */

import { histogram } from './histogram';
import { BitMatrix } from '/common/BitMatrix';

const BLOCK_SIZE_POWER = 3;
const MIN_DYNAMIC_RANGE = 24;
const BLOCK_SIZE = 1 << BLOCK_SIZE_POWER;
const BLOCK_SIZE_MASK = BLOCK_SIZE - 1;
const MINIMUM_DIMENSION = BLOCK_SIZE * 5;

function calculateSubSize(size: number): number {
  let subSize = size >> BLOCK_SIZE_POWER;

  if (size & BLOCK_SIZE_MASK) {
    subSize++;
  }

  return subSize;
}

function clamp(value: number, max: number): number {
  return value < 2 ? 2 : Math.min(value, max);
}

function calculateOffset(offset: number, max: number): number {
  offset = offset << BLOCK_SIZE_POWER;

  return offset > max ? max : offset;
}

function calculateBlackPoints(luminances: Uint8Array, width: number, height: number): Int32Array[] {
  const blackPoints: Int32Array[] = [];
  const maxOffsetX = width - BLOCK_SIZE;
  const maxOffsetY = height - BLOCK_SIZE;
  const subWidth = calculateSubSize(width);
  const subHeight = calculateSubSize(height);

  for (let y = 0; y < subHeight; y++) {
    blackPoints[y] = new Int32Array(subWidth);

    const offsetY = calculateOffset(y, maxOffsetY);

    for (let x = 0; x < subWidth; x++) {
      let sum = 0;
      let max = 0;
      let min = 0xff;

      const offsetX = calculateOffset(x, maxOffsetX);

      for (let y1 = 0, offset = offsetY * width + offsetX; y1 < BLOCK_SIZE; y1++, offset += width) {
        for (let x1 = 0; x1 < BLOCK_SIZE; x1++) {
          const luminance = luminances[offset + x1];

          sum += luminance;

          // still looking for good contrast
          if (luminance < min) {
            min = luminance;
          }

          if (luminance > max) {
            max = luminance;
          }
        }

        // short-circuit min/max tests once dynamic range is met
        if (max - min > MIN_DYNAMIC_RANGE) {
          // finish the rest of the rows quickly
          for (y1++, offset += width; y1 < BLOCK_SIZE; y1++, offset += width) {
            for (let x1 = 0; x1 < BLOCK_SIZE; x1++) {
              sum += luminances[offset + x1];
            }
          }
        }
      }

      // The default estimate is the average of the values in the block.
      let average = sum >> (BLOCK_SIZE_POWER * 2);

      if (max - min <= MIN_DYNAMIC_RANGE) {
        // If variation within the block is low, assume this is a block with only light or only
        // dark pixels. In that case we do not want to use the average, as it would divide this
        // low contrast area into black and white pixels, essentially creating data out of noise.
        //
        // The default assumption is that the block is light/background. Since no estimate for
        // the level of dark pixels exists locally, use half the min for the block.
        average = min / 2;

        if (y > 0 && x > 0) {
          // Correct the "white background" assumption for blocks that have neighbors by comparing
          // the pixels in this block to the previously calculated black points. This is based on
          // the fact that dark barcode symbology is always surrounded by some amount of light
          // background for which reasonable black point estimates were made. The bp estimated at
          // the boundaries is used for the interior.
          // The (min < bp) is arbitrary but works better than other heuristics that were tried.
          const averageNeighborBlackPoint = (blackPoints[y - 1][x] + 2 * blackPoints[y][x - 1] + blackPoints[y - 1][x - 1]) / 4;

          if (min < averageNeighborBlackPoint) {
            average = averageNeighborBlackPoint;
          }
        }
      }

      blackPoints[y][x] = average;
    }
  }

  return blackPoints;
}

function adaptiveThreshold(luminances: Uint8Array, width: number, height: number): BitMatrix {
  const maxOffsetX = width - BLOCK_SIZE;
  const maxOffsetY = height - BLOCK_SIZE;
  const subWidth = calculateSubSize(width);
  const subHeight = calculateSubSize(height);
  const matrix = new BitMatrix(width, height);
  const blackPoints = calculateBlackPoints(luminances, width, height);

  for (let y = 0; y < subHeight; y++) {
    const top = clamp(y, subHeight - 3);
    const offsetY = calculateOffset(y, maxOffsetY);

    for (let x = 0; x < subWidth; x++) {
      let sum = 0;

      const left = clamp(x, subWidth - 3);
      const offsetX = calculateOffset(x, maxOffsetX);

      for (let z = -2; z <= 2; z++) {
        const blackRow = blackPoints[top + z];

        sum += blackRow[left - 2] + blackRow[left - 1] + blackRow[left] + blackRow[left + 1] + blackRow[left + 2];
      }

      const average = sum / 25;

      for (let y = 0, offset = offsetY * width + offsetX; y < BLOCK_SIZE; y++, offset += width) {
        for (let x = 0; x < BLOCK_SIZE; x++) {
          // Comparison needs to be <= so that black == 0 pixels are black even if the threshold is 0.
          if (luminances[offset + x] <= average) {
            matrix.set(offsetX + x, offsetY + y);
          }
        }
      }
    }
  }

  return matrix;
}

export function grayscale({ data, width, height }: ImageData): Uint8Array {
  // Convert image to grayscale
  const luminances = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const offset = y * width;

    for (let x = 0; x < width; x++) {
      const index = offset + x;
      const colorIndex = index * 4;
      const r = data[colorIndex];
      const g = data[colorIndex + 1];
      const b = data[colorIndex + 2];

      // 0.299R + 0.587G + 0.114B (YUV/YIQ for PAL and NTSC),
      // (R * 306) >> 10 is approximately equal to R * 0.299, and so on.
      // 0x200 >> 10 is 0.5, it implements rounding.
      luminances[offset + x] = (r * 306 + g * 601 + b * 117 + 0x200) >> 10;
    }
  }

  return luminances;
}

export function binarize(luminances: Uint8Array, width: number, height: number): BitMatrix {
  if (luminances.length !== width * height) {
    throw new Error('luminances length must be equals to width * height');
  }

  if (width < MINIMUM_DIMENSION || height < MINIMUM_DIMENSION) {
    return histogram(luminances, width, height);
  } else {
    return adaptiveThreshold(luminances, width, height);
  }
}
