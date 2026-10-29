/**
 * @module GifWriter
 */

export class GifWriter {
  #length = 0;
  #bytes = new Uint8Array(4096);

  #ensure(size: number): void {
    const bytes = this.#bytes;
    const length = this.#length;
    const needed = length + size;

    if (needed > bytes.length) {
      let capacity = bytes.length * 2;

      while (capacity < needed) {
        capacity *= 2;
      }

      const next = new Uint8Array(capacity);

      next.set(bytes.subarray(0, length));

      this.#bytes = next;
    }
  }

  public get bytes(): Uint8Array {
    return this.#bytes.subarray(0, this.#length);
  }

  public writeByte(value: number): void {
    this.#ensure(1);

    this.#bytes[this.#length++] = value & 0xff;
  }

  public writeInt16(value: number): void {
    this.#ensure(2);

    const bytes = this.#bytes;

    bytes[this.#length++] = value & 0xff;
    bytes[this.#length++] = (value >> 8) & 0xff;
  }

  public writeBytes(source: Uint8Array, offset = 0, length = source.length - offset): void {
    this.#ensure(length);

    const bytes = this.#bytes;

    bytes.set(source.subarray(offset, offset + length), this.#length);

    this.#length += length;
  }
}
