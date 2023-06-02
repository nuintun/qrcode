/**
 * @module BitArray
 */

import { isNumber, toUInt32 } from './utils';

const LOAD_FACTOR = 0.75;

function makeArray(length: number): Int32Array {
  return new Int32Array(toUInt32((length + 31) / 32));
}

export class BitArray {
  #length: number;
  #bits: Int32Array;

  constructor(length: number = 0) {
    this.#length = length;
    this.#bits = makeArray(length);
  }

  #offset(index: number): number {
    return toUInt32(index / 32);
  }

  #alloc(length: number): void {
    const bits = this.#bits;

    if (length > bits.length * 32) {
      const newBits = makeArray(Math.ceil(length / LOAD_FACTOR));

      newBits.set(bits);

      this.#bits = newBits;
    }
  }

  public get length(): number {
    return this.#length;
  }

  public get byteLength(): number {
    return toUInt32((this.#length + 7) / 8);
  }

  public set(index: number): void {
    const offset = this.#offset(index);

    this.#bits[offset] |= 1 << (index & 0x1f);
  }

  public get(index: number): boolean {
    const offset = this.#offset(index);

    return (this.#bits[offset] & (1 << (index & 0x1f))) !== 0;
  }

  public flip(index: number): void {
    const offset = this.#offset(index);

    this.#bits[offset] ^= 1 << (index & 0x1f);
  }

  public xor(mask: BitArray): void {
    if (this.#length !== mask.#length) {
      throw new Error('mask do not have same length');
    }

    const bits = this.#bits;
    const { length } = bits;
    const maskBits = mask.#bits;

    for (let i = 0; i < length; i++) {
      // The last int could be incomplete (i.e. not have 32 bits in
      // it) but there is no problem since 0 XOR 0 == 0.
      bits[i] ^= maskBits[i];
    }
  }

  public append(bit: boolean): void;
  public append(array: BitArray): void;
  public append(value: number, length: number): void;
  public append(value: number | boolean | BitArray, length?: number): void {
    let index = this.#length;

    if (value instanceof BitArray) {
      length = value.#length;

      this.#alloc(index + length);

      for (let i = 0; i < length; i++) {
        if (value.get(i)) {
          this.set(index);
        }

        index++;
      }

      this.#length = index;
    } else if (isNumber(value)) {
      if (length == null || length < 0 || length > 32) {
        throw new Error('length must be between 0 and 32');
      }

      this.#alloc(index + length);

      for (let i = length - 1; i >= 0; i--) {
        if ((value & (1 << i)) !== 0) {
          this.set(index);
        }

        index++;
      }

      this.#length = index;
    } else {
      length = index + 1;

      this.#alloc(length);

      if (value) {
        this.set(index);
      }

      this.#length = length;
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
