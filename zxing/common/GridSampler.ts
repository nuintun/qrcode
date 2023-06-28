/**
 * @module GridSampler
 */

import { toInt32 } from './utils';
import { BitMatrix } from './BitMatrix';
import { PerspectiveTransform } from './PerspectiveTransform';

export class GridSampler {
  #matrix: BitMatrix;

  constructor(matrix: BitMatrix) {
    this.#matrix = matrix;
  }

  #checkAndNudgePoints(points: number[]): void {
    let nudged = true;

    const { length } = points;
    const matrix = this.#matrix;
    const { width, height } = matrix;

    // Check and nudge points from start until we see some that are OK:
    for (let offset = 0; offset < length && nudged; offset += 2) {
      nudged = false;

      const x = toInt32(points[offset]);
      const y = toInt32(points[offset + 1]);

      if (x === -1) {
        nudged = true;
        points[offset] = 0;
      } else if (x === width) {
        nudged = true;
        points[offset] = width - 1;
      }

      if (y === -1) {
        nudged = true;
        points[offset + 1] = 0;
      } else if (y === height) {
        nudged = true;
        points[offset + 1] = height - 1;
      }
    }

    nudged = true;

    // Check and nudge points from end
    for (let offset = length - 2; offset >= 0 && nudged; offset -= 2) {
      nudged = false;

      const x = toInt32(points[offset]);
      const y = toInt32(points[offset + 1]);

      if (x === -1) {
        nudged = true;
        points[offset] = 0;
      } else if (x === width) {
        nudged = true;
        points[offset] = width - 1;
      }

      if (y === -1) {
        nudged = true;
        points[offset + 1] = 0;
      } else if (y === height) {
        nudged = true;
        points[offset + 1] = height - 1;
      }
    }
  }

  public sampleGrid(width: number, height: number, transform: PerspectiveTransform): BitMatrix {
    const max = 2 * width;
    const matrix = this.#matrix;
    const points: number[] = [];
    const bits = new BitMatrix(width, height);

    for (let y = 0; y < height; y++) {
      const value = y + 0.5;

      for (let x = 0; x < max; x += 2) {
        points[x] = x / 2 + 0.5;
        points[x + 1] = value;
      }

      transform.transformPoints(points);

      this.#checkAndNudgePoints(points);

      for (let x = 0; x < max; x += 2) {
        if (matrix.get(toInt32(points[x]), toInt32(points[x + 1]))) {
          // Black(-ish) pixel
          bits.set(x / 2, y);
        }
      }
    }

    return bits;
  }
}
