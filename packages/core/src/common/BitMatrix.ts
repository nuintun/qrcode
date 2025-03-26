/**
 * @module BitMatrix
 */

import { toBit, toInt32 } from './utils';

export class BitMatrix {
  #width: number;
  #height: number;
  #rowSize: number;
  #bits: Int32Array;

  /**
   * @constructor
   * @param width The width of the matrix.
   * @param height The height of the matrix.
   * @param bits The initial bits of the matrix.
   */
  constructor(width: number, height: number, bits?: Int32Array) {
    const rowSize = Math.ceil(width / 32);
    const bitsCapacity = rowSize * height;

    this.#width = width;
    this.#height = height;
    this.#rowSize = rowSize;

    if (bits instanceof Int32Array) {
      if (bits.length !== bitsCapacity) {
        throw new Error(`matrix bits capacity mismatch: ${bitsCapacity}`);
      }

      this.#bits = bits;
    } else {
      this.#bits = new Int32Array(bitsCapacity);
    }
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
   * @description Set the bit value of the specified coordinate.
   * @param x The x coordinate.
   * @param y The y coordinate.
   * @param bit The bit value to set, default is 1.
   */
  public set(x: number, y: number, bit: 0 | 1 = 1): void {
    const bitMask = 1 << (x & 0x1f);
    const bitOffset = this.#offset(x, y);

    if (bit) {
      this.#bits[bitOffset] |= bitMask;
    } else {
      this.#bits[bitOffset] &= ~bitMask;
    }
  }

  /**
   * @method get
   * @description Get the bit value of the specified coordinate.
   * @param x The x coordinate.
   * @param y The y coordinate.
   */
  public get(x: number, y: number): 0 | 1 {
    return toBit(this.#bits[this.#offset(x, y)] >>> (x & 0x1f));
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
      const offset = this.#offset(x, y);

      this.#bits[offset] ^= 1 << (x & 0x1f);
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
    return new BitMatrix(this.#width, this.#height, new Int32Array(this.#bits));
  }

  /**
   * @method setRegion
   * @description Set the bit value of the specified region.
   * @param left The left coordinate.
   * @param top The top coordinate.
   * @param width The width to set.
   * @param height The height to set.
   * @param bit The bit value to set, default is 1.
   */
  public setRegion(left: number, top: number, width: number, height: number, bit: 0 | 1 = 1): void {
    const bits = this.#bits;
    const right = left + width;
    const bottom = top + height;
    const rowSize = this.#rowSize;

    for (let y = top; y < bottom; y++) {
      const offset = y * rowSize;

      for (let x = left; x < right; x++) {
        const bitMask = 1 << (x & 0x1f);
        const bitOffset = offset + toInt32(x / 32);

        if (bit) {
          bits[bitOffset] |= bitMask;
        } else {
          bits[bitOffset] &= ~bitMask;
        }
      }
    }
  }
}
