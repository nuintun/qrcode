/**
 * @module Encoded
 */

import { Version } from '/common/Version';
import { ByteMatrix } from '/common/ByteMatrix';
import { ECLevel, Level } from '/common/ECLevel';
import { Colors, GifImage } from '/common/image/GifImage';

export class Encoded {
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

  /**
   * @property matrix
   * @description Get the size of qrcode.
   */
  public get size(): number {
    return this.#matrix.size;
  }

  /**
   * @property mask
   * @description Get the mask of qrcode.
   */
  public get mask(): number {
    return this.#mask;
  }

  /**
   * @property level
   * @description Get the error correction level of qrcode.
   */
  public get level(): `${Level}` {
    return this.#level.name;
  }

  /**
   * @property version
   * @description Get the version of qrcode.
   */
  public get version(): number {
    return this.#version.version;
  }

  /**
   * @method get
   * @description Get the bit value of the specified coordinate of qrcode.
   */
  public get(x: number, y: number): 0 | 1 {
    const { size } = this.#matrix;

    if (x < 0 || y < 0 || x >= size || y >= size) {
      throw new Error(`illegal coordinate: [${x}, ${y}]`);
    }

    return this.#matrix.get(x, y) as 0 | 1;
  }

  /**
   * @method toDataURL
   * @param moduleSize The size of one qrcode module
   * @param options Set rest options of gif, like margin, foreground and background.
   */
  public toDataURL(moduleSize: number = 2, { margin = moduleSize * 4, ...colors }: Colors & { margin?: number } = {}): string {
    moduleSize = Math.max(1, moduleSize >> 0);
    margin = Math.max(0, margin >> 0);

    const matrix = this.#matrix;
    const matrixSize = matrix.size;
    const size = moduleSize * matrixSize + margin * 2;
    const gif = new GifImage(size, size, colors);

    // Rasterize module by module; margin and background pixels default to 0.
    for (let moduleY = 0; moduleY < matrixSize; moduleY++) {
      const pixelY = margin + moduleY * moduleSize;

      for (let moduleX = 0; moduleX < matrixSize; moduleX++) {
        const color = matrix.get(moduleX, moduleY);

        if (color !== 0) {
          gif.fillRect(margin + moduleX * moduleSize, pixelY, moduleSize, moduleSize, color);
        }
      }
    }

    return gif.toDataURL();
  }
}
