/**
 * @module BitStream
 */

import { ByteArray } from './ByteArray';

export class BitStream {
  #bit: number;
  #buffer: ByteArray;
  #available: number;

  constructor() {
    this.#bit = 0;
    this.#available = 0;
    this.#buffer = new ByteArray();
  }

  public get bytes(): number[] {
    return this.#buffer.bytes;
  }

  public write(value: number, length: number): void {
    let bit = this.#bit;
    let available = this.#available;

    const buffer = this.#buffer;

    while (available + length >= 8) {
      buffer.writeByte((bit | (value << available)) & 0xff);

      length -= 8 - available;
      value >>>= 8 - available;

      bit = 0;
      available = 0;
    }

    this.#available = available + length;
    this.#bit = bit | (value << available);
  }

  public flush(): void {
    if (this.#available > 0) {
      this.#buffer.writeByte(this.#bit);
    }

    this.#bit = 0;
    this.#available = 0;
  }
}
