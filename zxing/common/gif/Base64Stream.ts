/**
 * @module Base64Stream
 */

import { ByteArray } from './ByteArray';

function encode(ch: number): number {
  if (ch >= 0) {
    if (ch < 26) {
      // A
      return 0x41 + ch;
    } else if (ch < 52) {
      // a
      return 0x61 + (ch - 26);
    } else if (ch < 62) {
      // 0
      return 0x30 + (ch - 52);
    } else if (ch === 62) {
      // +
      return 0x2b;
    } else if (ch === 63) {
      // /
      return 0x2f;
    }
  }

  throw new Error(`illegal char: ${String.fromCharCode(ch)}`);
}

export class Base64Stream {
  #buffer = 0;
  #length = 0;
  #bufLength = 0;
  #stream: ByteArray = new ByteArray();

  #writeEncoded(byte: number): void {
    this.#stream.writeByte(encode(byte & 0x3f));
  }

  public get bytes(): number[] {
    return this.#stream.bytes;
  }

  public writeByte(byte: number): void {
    this.#buffer = (this.#buffer << 8) | (byte & 0xff);
    this.#bufLength += 8;
    this.#length++;

    while (this.#bufLength >= 6) {
      this.#writeEncoded(this.#buffer >>> (this.#bufLength - 6));

      this.#bufLength -= 6;
    }
  }

  public writeBytes(bytes: number[], offset?: number, length?: number): void {
    this.#stream.writeBytes(bytes, offset, length);
  }

  public flush(): void {
    if (this.#bufLength > 0) {
      this.#writeEncoded(this.#buffer << (6 - this.#bufLength));

      this.#buffer = 0;
      this.#bufLength = 0;
    }

    const stream = this.#stream;

    if (this.#length % 3 != 0) {
      // Padding
      const pad = 3 - (this.#length % 3);

      for (let i = 0; i < pad; i++) {
        // =
        stream.writeByte(0x3d);
      }
    }
  }
}
