/**
 * @module Base64Stream
 */

import { ByteArray } from './ByteArray';

export const { fromCharCode } = String;

function encode(byte: number): number {
  byte &= 0x3f;

  if (byte >= 0) {
    if (byte < 26) {
      // A
      return 0x41 + byte;
    } else if (byte < 52) {
      // a
      return 0x61 + (byte - 26);
    } else if (byte < 62) {
      // 0
      return 0x30 + (byte - 52);
    } else if (byte === 62) {
      // +
      return 0x2b;
    } else if (byte === 63) {
      // /
      return 0x2f;
    }
  }

  throw new Error(`illegal char: ${fromCharCode(byte)}`);
}

export class Base64Stream {
  #bits = 0;
  #buffer = 0;
  #length = 0;
  #stream: ByteArray = new ByteArray();

  public get bytes(): number[] {
    return this.#stream.bytes;
  }

  public write(byte: number): void {
    let bits = this.#bits + 8;

    const stream = this.#stream;
    const buffer = (this.#buffer << 8) | (byte & 0xff);

    while (bits >= 6) {
      stream.writeByte(encode(buffer >>> (bits - 6)));

      bits -= 6;
    }

    this.#length++;
    this.#bits = bits;
    this.#buffer = buffer;
  }

  public close(): void {
    const bits = this.#bits;
    const stream = this.#stream;

    if (bits > 0) {
      stream.writeByte(encode(this.#buffer << (6 - bits)));

      this.#bits = 0;
      this.#buffer = 0;
    }

    const length = this.#length;

    if (length % 3 != 0) {
      // Padding
      const pad = 3 - (length % 3);

      for (let i = 0; i < pad; i++) {
        // =
        stream.writeByte(0x3d);
      }
    }
  }
}
