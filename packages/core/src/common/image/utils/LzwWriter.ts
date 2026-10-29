/**
 * @module LzwWriter
 * @see https://github.com/google/dart-gif-encoder
 */

import { Dict } from './Dict';
import { GifWriter } from './GifWriter';

// GIF data sub-blocks carry at most 255 bytes; the length byte precedes the
// data, so up to 255 bytes must be gathered before the block can be written.
const BLOCK_SIZE = 255;

/**
 * Packs LZW codes of `dict.bits` width into bytes (little endian bit order),
 * then writes them out as GIF data sub-blocks on `stream`.
 */
export class LzwWriter {
  #bits = 0;
  #size = 0;
  #buffer = 0;
  #dict: Dict;
  #stream: GifWriter;
  #block = new Uint8Array(BLOCK_SIZE);

  constructor(dict: Dict, stream: GifWriter) {
    this.#dict = dict;
    this.#stream = stream;

    stream.writeByte(dict.depth);
  }

  #push(value: number): void {
    this.#block[this.#size++] = value;

    if (this.#size >= BLOCK_SIZE) {
      this.#flush();
    }
  }

  #flush(): void {
    this.#stream.writeByte(this.#size);
    this.#stream.writeBytes(this.#block, 0, this.#size);

    this.#size = 0;
  }

  public write(code: number): void {
    let bits = this.#bits;
    let buffer = this.#buffer | (code << bits);

    bits += this.#dict.bits;

    while (bits >= 8) {
      this.#push(buffer);

      buffer >>= 8;
      bits -= 8;
    }

    this.#bits = bits;
    this.#buffer = buffer;
  }

  public finish(): void {
    // Add the remaining bits. (Unused bits are set to zero.)
    if (this.#bits > 0) {
      this.#push(this.#buffer);
    }

    if (this.#size > 0) {
      this.#flush();
    }

    // Block terminator.
    this.#stream.writeByte(0);
  }
}
