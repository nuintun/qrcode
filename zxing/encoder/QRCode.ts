/**
 * @module QRCode
 */

import { ByteMatrix } from './ByteMatrix';
import { GIFImage } from 'src/image/GIFImage';

export class QRCode {
  #matrix: ByteMatrix;

  constructor(matrix: ByteMatrix) {
    this.#matrix = matrix;
  }

  /**
   * @public
   * @method toDataURL
   * @param {number} moduleSize
   * @param {number} margin
   * @returns {string}
   */
  public toDataURL(moduleSize: number = 2, margin: number = moduleSize * 4): string {
    moduleSize = Math.max(1, moduleSize >> 0);
    margin = Math.max(0, margin >> 0);

    const matrix = this.#matrix;
    const matrixSize = matrix.width;
    const size = moduleSize * matrixSize + margin * 2;
    const min = margin;
    const max = size - margin;
    const gif = new GIFImage(size, size);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (min <= j && j < max && min <= i && i < max) {
          const x = ((j - min) / moduleSize) >> 0;
          const y = ((i - min) / moduleSize) >> 0;

          gif.set(j, i, matrix.get(x, y) ? 0 : 1);
        } else {
          gif.set(j, i, 1);
        }
      }
    }

    return gif.toDataURL();
  }
}
