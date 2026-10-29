/**
 * @module Encoded
 */

import { Version } from '/common/Version';
import { ByteMatrix } from '/common/ByteMatrix';
import { ECLevel, Level } from '/common/ECLevel';
import { Colors, GifImage, ReadRow } from '/common/image/GifImage';

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
    const last = margin + matrixSize * moduleSize;
    const size = moduleSize * matrixSize + margin * 2;

    // Rasterize rows on demand; margin and background pixels stay 0.
    const readRow: ReadRow = (row, buffer) => {
      if (row >= margin && row < last) {
        const moduleY = ((row - margin) / moduleSize) | 0;

        for (let moduleX = 0; moduleX < matrixSize; moduleX++) {
          if (matrix.get(moduleX, moduleY) !== 0) {
            const start = margin + moduleX * moduleSize;

            buffer.fill(1, start, start + moduleSize);
          }
        }
      }
    };

    return new GifImage(size, size, readRow, colors).toDataURL();
  }
}
