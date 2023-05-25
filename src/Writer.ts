/**
 * @module Writer
 */

import { Encoder } from './encoder';
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

    const matrixSize = this.size;
    const size = moduleSize * matrixSize + margin * 2;

    const min = margin;
    const max = size - margin;
    const gif = new GIFImage(size, size);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (min <= x && x < max && min <= y && y < max) {
          const row = ((y - min) / moduleSize) >> 0;
          const col = ((x - min) / moduleSize) >> 0;

          gif.setPixel(x, y, this.isDark(row, col) ? 0 : 1);
        } else {
          gif.setPixel(x, y, 1);
        }
      }
    }

    return gif.toDataURL();
  }
}
