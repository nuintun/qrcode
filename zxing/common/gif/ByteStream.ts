/**
 * @module ByteStream
 */

export class ByteStream {
  #bytes: number[] = [];

  public get bytes(): number[] {
    return this.#bytes;
  }

  public writeByte(value: number): void {
    this.#bytes.push(value);
  }

  public writeInt16(value: number): void {
    this.#bytes.push(value, value >>> 8);
  }

  public writeBytes(bytes: number[], offset: number = 0, length: number = bytes.length): void {
    const buffer = this.#bytes;

    for (let i = 0; i < length; i++) {
      buffer.push(bytes[offset + i]);
    }
  }
}
