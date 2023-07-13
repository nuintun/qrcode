/**
 * @module binarizer
 */

import { BitMatrix } from './BitMatrix';

const REGION_SIZE = 8;
const MIN_DYNAMIC_RANGE = 24;

function between(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function binarize({ data, width, height }: ImageData): BitMatrix {
  if (data.length !== width * height * 4) {
    throw new Error('malformed data passed to binarizer');
  }

  // Convert image to greyscale
  const greyscale = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const offset = y * width;

    for (let x = 0; x < width; x++) {
      const index = offset + x;
      const colorIndex = index * 4;
      const r = data[colorIndex + 0];
      const g = data[colorIndex + 1];
      const b = data[colorIndex + 2];

      greyscale[offset + x] = r * 0.2126 + g * 0.7152 + b * 0.0722;
    }
  }

  const blackPointsWidth = Math.ceil(width / REGION_SIZE);
  const blackPointsHeight = Math.ceil(height / REGION_SIZE);
  const blackPoints = new Uint8Array(blackPointsWidth * blackPointsHeight);

  for (let blackPointsY = 0; blackPointsY < blackPointsHeight; blackPointsY++) {
    const offset = blackPointsY * blackPointsWidth;
    const prevOffset = offset - blackPointsWidth;

    for (let blackPointsX = 0; blackPointsX < blackPointsWidth; blackPointsX++) {
      let sum = 0;
      let max = 0;
      let min = Infinity;

      for (let y = 0; y < REGION_SIZE; y++) {
        const offset = (blackPointsY * REGION_SIZE + y) * width;

        for (let x = 0; x < REGION_SIZE; x++) {
          const pixelLumosity = greyscale[offset + blackPointsX * REGION_SIZE + x];

          sum += pixelLumosity;
          min = Math.min(min, pixelLumosity);
          max = Math.max(max, pixelLumosity);
        }
      }

      let average = sum / (REGION_SIZE * REGION_SIZE);

      if (max - min <= MIN_DYNAMIC_RANGE) {
        // If variation within the block is low, assume this is a block with only light or only
        // dark pixels. In that case we do not want to use the average, as it would divide this
        // low contrast area into black and white pixels, essentially creating data out of noise.
        //
        // Default the blackpoint for these blocks to be half the min - effectively white them out
        average = min / 2;

        if (blackPointsX > 0 && blackPointsY > 0) {
          // Correct the "white background" assumption for blocks that have neighbors by comparing
          // the pixels in this block to the previously calculated black points. This is based on
          // the fact that dark barcode symbology is always surrounded by some amount of light
          // background for which reasonable black point estimates were made. The bp estimated at
          // the boundaries is used for the interior.
          // The (min < bp) is arbitrary but works better than other heuristics that were tried.
          const topRightPoint = blackPoints[prevOffset + blackPointsX];
          const bottomLeftPoint = blackPoints[offset + blackPointsX - 1];
          const topLeftPoint = blackPoints[prevOffset + blackPointsX - 1];
          const averageNeighborBlackPoint = (topRightPoint + 2 * bottomLeftPoint + topLeftPoint) / 4;

          if (min < averageNeighborBlackPoint) {
            average = averageNeighborBlackPoint;
          }
        }
      }

      blackPoints[offset + blackPointsX] = average;
    }
  }

  const binarized = new BitMatrix(width, height);

  for (let blackPointsY = 0; blackPointsY < blackPointsHeight; blackPointsY++) {
    const top = between(blackPointsY, 2, blackPointsHeight - 3);

    for (let blackPointsX = 0; blackPointsX < blackPointsWidth; blackPointsX++) {
      let sum = 0;

      const left = between(blackPointsX, 2, blackPointsWidth - 3);

      for (let regionY = -2; regionY <= 2; regionY++) {
        const offset = (top + regionY) * blackPointsWidth;

        for (let regionX = -2; regionX <= 2; regionX++) {
          sum += blackPoints[offset + left + regionX];
        }
      }

      const threshold = sum / 25;

      for (let regionY = 0; regionY < REGION_SIZE; regionY++) {
        const y = blackPointsY * REGION_SIZE + regionY;
        const offset = y * width;

        for (let regionX = 0; regionX < REGION_SIZE; regionX++) {
          const x = blackPointsX * REGION_SIZE + regionX;
          const lumina = greyscale[offset + x];

          if (lumina <= threshold) {
            binarized.set(x, y);
          }
        }
      }
    }
  }

  return binarized;
}
