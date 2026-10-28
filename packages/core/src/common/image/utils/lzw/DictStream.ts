/**
 * @module DictStream
 * @see https://github.com/google/dart-gif-encoder
 */

import { Dict } from './Dict';
import { ByteStream } from '/common/image/utils/ByteStream';

/**
 * Packs LZW codes of `dict.bits` width into bytes (little endian bit order),
 * then pipes them out as GIF data sub-blocks.
 */
export class DictStream {
  #bits = 0;
  #buffer = 0;
  #length = 0;
  #dict: Dict;
  // Self-managed buffer instead of a ByteStream accumulator: routing every LZW
  // byte through ByteStream.writeByte() was measured ~16% slower on hot paths.
  #bytes = new Uint8Array(1024);

  constructor(dict: Dict) {
    this.#dict = dict;
  }

  public write(code: number): void {
    let bits = this.#bits;
    let buffer = this.#buffer | (code << bits);

    bits += this.#dict.bits;

    while (bits >= 8) {
      this.#push(buffer & 0xff);

      buffer >>= 8;
      bits -= 8;
    }

    this.#bits = bits;
    this.#buffer = buffer;
  }

  public pipe(stream: ByteStream): void {
    // Add the remaining bits. (Unused bits are set to zero.)
    if (this.#bits > 0) {
      this.#push(this.#buffer);
    }

    stream.writeByte(this.#dict.depth);

    const bytes = this.#bytes;
    const length = this.#length;

    // Divide it up into blocks with a size in front of each block.
    for (let i = 0; i < length;) {
      const remain = Math.min(255, length - i);

      stream.writeByte(remain);
      stream.writeBytes(bytes, i, remain);

      i += remain;
    }

    stream.writeByte(0);
  }

  #push(value: number): void {
    if (this.#length === this.#bytes.length) {
      const grown = new Uint8Array(this.#bytes.length * 2);

      grown.set(this.#bytes);

      this.#bytes = grown;
    }

    this.#bytes[this.#length++] = value;
  }
}
