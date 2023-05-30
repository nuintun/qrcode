/**
 * @module BitArray
 */

import { isNumber, toUInt32 } from './utils';

const LOAD_FACTOR = 0.75;

function makeArray(length: number): Uint32Array {
  return new Uint32Array(toUInt32((length + 31) / 32));
}

export class BitArray {
  #length: number;
  #bits: Uint32Array;

  constructor(length: number = 0) {
    this.#length = length;
    this.#bits = makeArray(length);
  }

  #offset(index): number {
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
    this.#bits[this.#offset(index)] |= 1 << (index & 0x1f);
  }

  public get(index: number): boolean {
    return (this.#bits[this.#offset(index)] & (1 << (index & 0x1f))) !== 0;
  }

  public flip(index: number): void {
    this.#bits[this.#offset(index)] ^= 1 << (index & 0x1f);
  }

  public xor(mask: BitArray): void {
    if (this.#length !== mask.#length) {
      throw new Error("sizes don't match");
    }

    const bits = this.#bits;

    for (let i = 0, length = bits.length; i < length; i++) {
      // The last int could be incomplete (i.e. not have 32 bits in
      // it) but there is no problem since 0 XOR 0 == 0.
      bits[i] ^= mask.#bits[i];
    }
  }

  public append(bit: boolean): void;
  public append(array: BitArray): void;
  public append(value: number, length: number): void;
  public append(value: number | boolean | BitArray, length?: number): void {
    if (value instanceof BitArray) {
      const length = value.#length;

      this.#alloc(this.#length + length);

      for (let i = 0; i < length; i++) {
        this.append(value.get(i));
      }
    } else if (isNumber(value)) {
      if (length == null || length < 0 || length > 32) {
        throw new Error('length must be between 0 and 32');
      }

      let newLength = this.#length;

      this.#alloc(newLength + length);

      const bits = this.#bits;

      for (let i = length - 1; i >= 0; i--) {
        if ((value & (1 << i)) !== 0) {
          bits[this.#offset(newLength)] |= 1 << (newLength & 0x1f);
        }

        newLength++;
      }

      this.#length = newLength;
    } else {
      const bits = this.#bits;
      const length = this.#length;

      this.#alloc(length + 1);

      if (value) {
        bits[this.#offset(length)] |= 1 << (length & 0x1f);
      }

      this.#length = length + 1;
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
