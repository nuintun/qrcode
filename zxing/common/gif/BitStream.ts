/**
 * @module BitStream
 */

import { ByteArray } from './ByteArray';

export class BitStream {
  #buffer: number = 0;
  #available: number = 0;
  #stream: ByteArray = new ByteArray();

  public get bytes(): number[] {
    return this.#stream.bytes;
  }

  public write(value: number, length: number): void {
    let buffer = this.#buffer;
    let available = this.#available;

    const stream = this.#stream;

    while (available + length >= 8) {
      stream.writeByte((buffer | (value << available)) & 0xff);

      length -= 8 - available;
      value >>>= 8 - available;

      buffer = 0;
      available = 0;
    }

    this.#available = available + length;
    this.#buffer = buffer | (value << available);
  }

  public close(): void {
    if (this.#available > 0) {
      this.#stream.writeByte(this.#buffer);
    }

    this.#buffer = 0;
    this.#available = 0;
  }
}
