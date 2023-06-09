/**
 * @module Base64Stream
 */

import { ByteArray } from './ByteArray';

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

  throw new Error(`illegal char: ${String.fromCharCode(byte)}`);
}

export class Base64Stream {
  #buffer = 0;
  #length = 0;
  #bufLength = 0;
  #stream: ByteArray = new ByteArray();

  public get bytes(): number[] {
    return this.#stream.bytes;
  }

  public writeByte(byte: number): void {
    let bufLength = this.#bufLength + 8;

    const buffer = (this.#buffer << 8) | (byte & 0xff);

    while (bufLength >= 6) {
      this.writeByte(encode(buffer >>> (bufLength - 6)));

      bufLength -= 6;
    }

    this.#length++;
    this.#buffer = buffer;
    this.#bufLength = bufLength;
  }

  public writeBytes(bytes: number[], offset?: number, length?: number): void {
    this.#stream.writeBytes(bytes, offset, length);
  }

  public close(): void {
    const stream = this.#stream;
    const length = this.#length;
    const bufLength = this.#bufLength;

    if (bufLength > 0) {
      this.writeByte(encode(this.#buffer << (6 - bufLength)));

      this.#buffer = 0;
      this.#bufLength = 0;
    }

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
