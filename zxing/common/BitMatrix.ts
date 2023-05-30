/**
 * @module BitMatrix
 */

import { toUInt32 } from './utils';

export class BitMatrix {
  #width: number;
  #height: number;
  #rowSize: number;
  #bits: Uint32Array;

  constructor(dimension: number);
  constructor(width: number, height: number);
  constructor(width: number, height: number, rowSize: number, bits: Uint32Array);
  constructor(
    width: number,
    height: number = width,
    rowSize: number = toUInt32((width + 31) / 32),
    bits: Uint32Array = new Uint32Array(rowSize * height)
  ) {
    this.#bits = bits;
    this.#width = width;
    this.#height = height;
    this.#rowSize = rowSize;
  }

  #offset(x: number, y: number): number {
    return toUInt32(y * this.#rowSize + x / 32);
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public get rowSize(): number {
    return this.#rowSize;
  }

  public set(x: number, y: number): void {
    const offset = this.#offset(x, y);

    this.#bits[offset] |= 1 << (x & 0x1f);
  }

  public get(x: number, y: number): boolean {
    const offset = this.#offset(x, y);

    return ((this.#bits[offset] >>> (x & 0x1f)) & 1) !== 0;
  }

  public unset(x: number, y: number): void {
    const offset = this.#offset(x, y);

    this.#bits[offset] &= ~(1 << (x & 0x1f));
  }

  public flip(): void;
  public flip(x: number, y: number): void;
  public flip(x?: number, y?: number): void {
    if (x != null && y != null) {
      const offset = this.#offset(x, y);

      this.#bits[offset] ^= 1 << (x & 0x1f);
    } else {
      const bits = this.#bits;
      const max = bits.length;

      for (let i = 0; i < max; i++) {
        bits[i] = ~bits[i];
      }
    }
  }

  public xor(mask: BitMatrix): void {
    if (this.#width != mask.#width || this.#height != mask.#height || this.#rowSize != mask.#rowSize) {
      throw new Error('input matrix dimensions do not match');
    }
  }

  public setRegion(left: number, top: number, width: number, height: number): void {
    if (top < 0 || left < 0) {
      throw new Error('left and top must be nonnegative');
    }

    if (height < 1 || width < 1) {
      throw new Error('height and width must be at least 1');
    }

    const right = left + width;
    const bottom = top + height;

    if (bottom > this.#height || right > this.#width) {
      throw new Error('the region must fit inside the matrix');
    }

    const bits = this.#bits;
    const rowSize = this.#rowSize;

    for (let y = top; y < bottom; y++) {
      const offset = y * rowSize;

      for (let x = left; x < right; x++) {
        bits[toUInt32(offset + x / 32)] |= 1 << (x & 0x1f);
      }
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
