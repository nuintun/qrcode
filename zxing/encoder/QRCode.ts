/**
 * @module QRCode
 */

import { ECLevel } from '/common/ECLevel';
import { Version } from '/common/Version';
import { Colors, GIFImage } from '/common/gif';
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
   * @property matrix
   * @description Get the matrix of qrcode
   */
  public get matrix(): ByteMatrix {
    return this.#matrix;
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
    const matrixSize = matrix.width;
    const size = moduleSize * matrixSize + margin * 2;
    const gif = new GIFImage(size, size, colors);
    const max = size - margin;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (margin <= j && j < max && margin <= i && i < max) {
          const x = Math.floor((j - margin) / moduleSize);
          const y = Math.floor((i - margin) / moduleSize);

          gif.set(j, i, matrix.get(x, y));
        } else {
          // Margin pixels
          gif.set(j, i, 0);
        }
      }
    }

    return gif.toDataURL();
  }
}
