/**
 * @module QRCode
 */

import { GIFImage } from '/common/gif';
import { ECLevel } from '/common/ECLevel';
import { Version } from '/common/Version';
import { ByteMatrix } from '/common/ByteMatrix';

export class QRCode {
  #mask: number;
  #level: ECLevel;
  #version: Version;
  #matrix: ByteMatrix;

  constructor(matrix: ByteMatrix, version: Version, level: ECLevel, mask: number) {
    this.#mask = mask;
    this.#level = level;
    this.#matrix = matrix;
    this.#version = version;
  }

  public get mask(): number {
    return this.#mask;
  }

  public get level(): string {
    return this.#level.name;
  }

  public get version(): number {
    return this.#version.version;
  }

  public get matrix(): ByteMatrix {
    return this.#matrix;
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
          const x = Math.floor((j - min) / moduleSize);
          const y = Math.floor((i - min) / moduleSize);

          gif.set(j, i, matrix.get(x, y) === 1 ? 0 : 1);
        } else {
          gif.set(j, i, 1);
        }
      }
    }

    return gif.toDataURL();
  }
}
