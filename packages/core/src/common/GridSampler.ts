/**
 * @module GridSampler
 */

import { toUint32 } from './utils';
import { BitMatrix } from './BitMatrix';
import { PerspectiveTransform } from './PerspectiveTransform';

export class GridSampler {
  #matrix: BitMatrix;
  #transform: PerspectiveTransform;

  constructor(matrix: BitMatrix, transform: PerspectiveTransform) {
    this.#matrix = matrix;
    this.#transform = transform;
  }

  public sample(width: number, height: number): BitMatrix {
    const matrix = this.#matrix;
    const matrixWidth = matrix.width;
    const transform = this.#transform;
    const matrixHeight = matrix.height;
    const bits = new BitMatrix(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [mappingX, mappingY] = transform.mapping(x + 0.5, y + 0.5);
        const offsetX = toUint32(mappingX);
        const offsetY = toUint32(mappingY);

        if (
          // Assert axis.
          offsetX >= 0 &&
          offsetY >= 0 &&
          offsetX < matrixWidth &&
          offsetY < matrixHeight &&
          matrix.get(offsetX, offsetY)
        ) {
          bits.set(x, y);
        }
      }
    }

    return bits;
  }
}
