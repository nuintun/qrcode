/**
 * @module DictStream
 * @see https://github.com/google/dart-gif-encoder
 */

import { Dict } from './Dict';
import { ByteStream } from '/common/image/utils/ByteStream';

export class DictStream {
  #bits = 0;
  #dict: Dict;
  #buffer = 0;
  #bytes: number[] = [];

  constructor(dict: Dict) {
    this.#dict = dict;
  }

  public write(code: number): void {
    let bits = this.#bits;
    let buffer = this.#buffer | (code << bits);

    bits += this.#dict.bits;

    const bytes = this.#bytes;

    while (bits >= 8) {
      bytes.push(buffer & 0xff);

      buffer >>= 8;
      bits -= 8;
    }

    this.#bits = bits;
    this.#buffer = buffer;
  }

  public pipe(stream: ByteStream): void {
    const bytes = this.#bytes;

    // Add the remaining bits. (Unused bits are set to zero.)
    if (this.#bits > 0) {
      bytes.push(this.#buffer);
    }

    stream.writeByte(this.#dict.depth);

    // Divide it up into blocks with a size in front of each block.
    const { length } = bytes;

    for (let i = 0; i < length; ) {
      const remain = length - i;

      if (remain >= 255) {
        stream.writeByte(0xff);
        stream.writeBytes(bytes, i, 255);

        i += 255;
      } else {
        stream.writeByte(remain);
        stream.writeBytes(bytes, i, remain);

        i = length;
      }
    }

    stream.writeByte(0);
  }
}
