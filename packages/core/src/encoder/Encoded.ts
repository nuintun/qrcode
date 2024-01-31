/**
 * @module Encoded
 */

import { toInt32 } from '/common/utils';
import { ECLevel } from '/common/ECLevel';
import { Version } from '/common/Version';
import { Colors, GIFImage } from '/common/gif';
import { ByteMatrix } from '/common/ByteMatrix';

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
   * @description Get the size of qrcode
   */
  public get size(): number {
    return this.#matrix.size;
  }

  /**
   * @property mask
   * @description Get the mask of qrcode
   */
  public get mask(): number {
    return this.#mask;
  }

  /**
   * @property level
   * @description Get the error correction level of qrcode
   */
  public get level(): string {
    return this.#level.name;
  }

  /**
   * @property version
   * @description Get the version of qrcode
   */
  public get version(): number {
    return this.#version.version;
  }

  /**
   * @method get
   * @description Get the bit value of the specified coordinate of qrcode
   */
  public get(x: number, y: number): number {
    const { size } = this.#matrix;

    if (x < 0 || y < 0 || x >= size || y >= size) {
      throw new Error(`illegal coordinate: [${x}, ${y}]`);
    }

    return this.#matrix.get(x, y);
  }

  /**
   * @method toDataURL
   * @param moduleSize The size of one qrcode module
   * @param options Set rest options of gif, like margin, foreground and background
   */
  public toDataURL(moduleSize: number = 2, { margin = moduleSize * 4, ...colors }: Colors & { margin?: number } = {}): string {
    moduleSize = Math.max(1, moduleSize >> 0);
    margin = Math.max(0, margin >> 0);

    const matrix = this.#matrix;
    const matrixSize = matrix.size;
    const size = moduleSize * matrixSize + margin * 2;
    const gif = new GIFImage(size, size, colors);
    const max = size - margin;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x >= margin && x < max && y >= margin && y < max) {
          const offsetX = toInt32((x - margin) / moduleSize);
          const offsetY = toInt32((y - margin) / moduleSize);

          gif.set(x, y, matrix.get(offsetX, offsetY));
        } else {
          // Margin pixels
          gif.set(x, y, 0);
        }
      }
    }

    return gif.toDataURL();
  }
}
