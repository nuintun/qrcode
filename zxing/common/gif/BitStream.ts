/**
 * @module BitStream
 */

import { ByteArray } from './ByteArray';

export class BitStream {
  #bits: number = 0;
  #available: number = 0;
  #buffer: ByteArray = new ByteArray();

  public get bytes(): number[] {
    return this.#buffer.bytes;
  }

  public write(value: number, length: number): void {
    let bits = this.#bits;
    let available = this.#available;

    const buffer = this.#buffer;

    while (available + length >= 8) {
      buffer.writeByte((bits | (value << available)) & 0xff);

      length -= 8 - available;
      value >>>= 8 - available;

      bits = 0;
      available = 0;
    }

    this.#available = available + length;
    this.#bits = bits | (value << available);
  }

  public close(): void {
    if (this.#available > 0) {
      this.#buffer.writeByte(this.#bits);
    }

    this.#bits = 0;
    this.#available = 0;
  }
}
