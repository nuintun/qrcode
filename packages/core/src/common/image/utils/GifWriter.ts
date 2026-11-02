/**
 * @module GifWriter
 */

export class GifWriter {
  #length = 0;
  #bytes = new Uint8Array(4096);

  #alloc(size: number): void {
    const bytes = this.#bytes;
    const length = this.#length;
    const needed = length + size;
    const byteLength = bytes.length;

    if (needed > byteLength) {
      const capacity = Math.max(byteLength * 2, needed);
      const next = new Uint8Array(capacity);

      next.set(bytes.subarray(0, length));

      this.#bytes = next;
    }
  }

  public get bytes(): Uint8Array {
    return this.#bytes.subarray(0, this.#length);
  }

  public writeByte(value: number): void {
    this.#alloc(1);

    this.#bytes[this.#length++] = value;
  }

  public writeInt16(value: number): void {
    this.#alloc(2);

    const bytes = this.#bytes;

    bytes[this.#length++] = value;
    bytes[this.#length++] = value >> 8;
  }

  public writeBytes(source: Uint8Array, offset = 0, length = source.length - offset): void {
    this.#alloc(length);

    const bytes = this.#bytes;

    bytes.set(source.subarray(offset, offset + length), this.#length);

    this.#length += length;
  }
}
