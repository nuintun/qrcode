/**
 * @module BitArray
 */

const LOAD_FACTOR = 0.75;

function offset(index: number): number {
  return Math.floor(index / 32);
}

function makeArray(length: number): Int32Array {
  return new Int32Array(Math.ceil(length / 32));
}

export class BitArray {
  #length: number;
  #bits: Int32Array;

  constructor(length: number = 0) {
    this.#length = length;
    this.#bits = makeArray(length);
  }

  #alloc(length: number): void {
    const bits = this.#bits;

    if (length > bits.length * 32) {
      const array = makeArray(Math.ceil(length / LOAD_FACTOR));

      array.set(bits);

      this.#bits = array;
    }

    this.#length = length;
  }

  public get length(): number {
    return this.#length;
  }

  public get byteLength(): number {
    return Math.ceil(this.#length / 8);
  }

  public set(index: number): void {
    this.#bits[offset(index)] |= 1 << (index & 0x1f);
  }

  public get(index: number): number {
    return (this.#bits[offset(index)] >>> (index & 0x1f)) & 1;
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
    } else {
      this.#alloc(index + length);

      for (let i = length - 1; i >= 0; i--) {
        if ((value >>> i) & 1) {
          this.set(index);
        }

        index++;
      }
    }
  }

  public toUint8Array(bitOffset: number, array: Uint8Array, offset: number, byteLength: number): void {
    for (let i = 0; i < byteLength; i++) {
      let byte = 0;

      for (let j = 0; j < 8; j++) {
        if (this.get(bitOffset++)) {
          byte |= 1 << (7 - j);
        }
      }

      array[offset + i] = byte;
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
