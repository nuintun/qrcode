/**
 * @module Encoded
 */

import { Version } from '/common/Version';
import { ByteMatrix } from '/common/ByteMatrix';
import { ECLevel, Level } from '/common/ECLevel';
import { GifImage, Options } from '/common/image/GifImage';

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

  public toDataURL(
    moduleSize: number = 2,
    {
      // Background color.
      background,
      // Foreground color.
      foreground,
      // Margin.
      margin = moduleSize * 4
    }: Omit<Options, 'scale'> = {}
  ): string {
    margin = Math.max(0, margin >> 0);
    moduleSize = Math.max(1, moduleSize >> 0);

    const matrix = this.#matrix;
    const matrixSize = matrix.size;
    const image = new GifImage(matrixSize, matrixSize, {
      margin,
      background,
      foreground,
      scale: moduleSize
    });

    for (let y = 0; y < matrixSize; y++) {
      for (let x = 0; x < matrixSize; x++) {
        if (matrix.get(x, y) !== 0) {
          image.setPixel(x, y, 1);
        }
      }
    }

    return image.toDataURL();
  }
}
