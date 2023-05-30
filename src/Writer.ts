/**
 * @module Writer
 */

import { Encoder } from './encoder';
import { isDark } from './encoder/Matrix';
import { GIFImage } from '/image/GIFImage';

export class Writer extends Encoder {
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

    const matrix = this.encode();
    const matrixSize = matrix.size;
    const size = moduleSize * matrixSize + margin * 2;

    console.log(matrix);

    const min = margin;
    const max = size - margin;
    const gif = new GIFImage(size, size);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (min <= j && j < max && min <= i && i < max) {
          const x = ((j - min) / moduleSize) >> 0;
          const y = ((i - min) / moduleSize) >> 0;

          gif.setPixel(j, i, isDark(matrix, x, y) ? 0 : 1);
        } else {
          gif.setPixel(j, i, 1);
        }
      }
    }

    return gif.toDataURL();
  }
}
