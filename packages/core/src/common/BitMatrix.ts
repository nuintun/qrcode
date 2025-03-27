/**
 * @module BitMatrix
 */

import { getBitMask, getBitOffset, toBit, toInt32 } from './utils';

export class BitMatrix {
  #width: number;
  #height: number;
  #rowSize: number;
  #bits: Int32Array;

  /**
   * @constructor
   * @param size The size of the square matrix.
   */
  constructor(size: number);
  /**
   * @constructor
   * @param width The width of the matrix.
   * @param height The height of the matrix.
   */
  constructor(width: number, height: number);
  constructor(width: number, height: number = width) {
    const rowSize = Math.ceil(width / 32);
    const bitsCapacity = rowSize * height;

    this.#width = width;
    this.#height = height;
    this.#rowSize = rowSize;
    this.#bits = new Int32Array(bitsCapacity);
  }

  #offset(x: number, y: number): number {
    return y * this.#rowSize + toInt32(x / 32);
  }

  /**
   * @property width
   * @description The width of the matrix.
   */
  public get width(): number {
    return this.#width;
  }

  /**
   * @property height
   * @description The height of the matrix.
   */
  public get height(): number {
    return this.#height;
  }

  /**
   * @method set
   * @description Set the bit value to 1 of the specified coordinate.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  public set(x: number, y: number): void {
    this.#bits[this.#offset(x, y)] |= getBitMask(x);
  }

  /**
   * @method get
   * @description Get the bit value of the specified coordinate.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  public get(x: number, y: number): 0 | 1 {
    return toBit(this.#bits[this.#offset(x, y)] >>> getBitOffset(x));
  }

  /**
   * @method flip
   * @description Flip the bit value of the specified coordinate.
   */
  public flip(): void;
  /**
   * @method flip
   * @description Flip the bit value of the specified coordinate.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  public flip(x: number, y: number): void;
  public flip(x?: number, y?: number): void {
    if (x != null && y != null) {
      this.#bits[this.#offset(x, y)] ^= getBitMask(x);
    } else {
      const bits = this.#bits;
      const { length } = bits;

      for (let i = 0; i < length; i++) {
        bits[i] = ~bits[i];
      }
    }
  }

  /**
   * @method clone
   * @description Clone the bit matrix.
   */
  public clone(): BitMatrix {
    const matrix = new BitMatrix(this.#width, this.#height);

    matrix.#bits.set(this.#bits);

    return matrix;
  }

  /**
   * @method setRegion
   * @description Set the bit value to 1 of the specified region.
   * @param left The left coordinate.
   * @param top The top coordinate.
   * @param width The width to set.
   * @param height The height to set.
   */
  public setRegion(left: number, top: number, width: number, height: number): void {
    const bits = this.#bits;
    const right = left + width;
    const bottom = top + height;
    const rowSize = this.#rowSize;

    for (let y = top; y < bottom; y++) {
      const offset = y * rowSize;

      for (let x = left; x < right; x++) {
        bits[offset + toInt32(x / 32)] |= getBitMask(x);
      }
    }
  }
}
