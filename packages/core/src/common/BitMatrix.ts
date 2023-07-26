/**
 * @module BitMatrix
 */

import { toInt32 } from './utils';

export class BitMatrix {
  #width: number;
  #height: number;
  #rowSize: number;
  #bits: Int32Array;

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

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public set(x: number, y: number): void {
    const offset = this.#offset(x, y);

    this.#bits[offset] |= 1 << (x & 0x1f);
  }

  public get(x: number, y: number): number {
    const offset = this.#offset(x, y);

    return (this.#bits[offset] >>> (x & 0x1f)) & 0x01;
  }

  public flip(): void;
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

  public clone(): BitMatrix {
    return new BitMatrix(this.#width, this.#height, new Int32Array(this.#bits));
  }

  public setRegion(left: number, top: number, width: number, height: number): void {
    const bits = this.#bits;
    const right = left + width;
    const bottom = top + height;
    const rowSize = this.#rowSize;

    for (let y = top; y < bottom; y++) {
      const offset = y * rowSize;

      for (let x = left; x < right; x++) {
        bits[offset + toInt32(x / 32)] |= 1 << (x & 0x1f);
      }
    }
  }
}
