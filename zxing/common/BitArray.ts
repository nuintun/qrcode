/**
 * @module BitArray
 */

import { toUInt32 } from './utils';

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

  public get(index: number): number {
    const offset = this.#offset(index);

    return (this.#bits[offset] >>> (index & 0x1f)) & 1;
  }

  public xor(mask: BitArray): void {
    const bits = this.#bits;
    const maskBits = mask.#bits;
    const length = Math.min(this.#length, mask.#length);

    for (let i = 0; i < length; i++) {
      // The last int could be incomplete (i.e. not have 32 bits in
      // it) but there is no problem since 0 XOR 0 == 0.
      bits[i] ^= maskBits[i];
    }
  }

  public append(array: BitArray): void;
  public append(value: number, length?: number): void;
  public append(value: number | BitArray, length: number = 1): void {
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
    } else {
      if (length < 1 || length > 32) {
        throw new Error('length must be between 1 and 32');
      }

      this.#alloc(index + length);

      for (let i = length - 1; i >= 0; i--) {
        if ((value & (1 << i)) !== 0) {
          this.set(index);
        }

        index++;
      }

      this.#length = index;
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
