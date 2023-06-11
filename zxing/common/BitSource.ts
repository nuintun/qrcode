/**
 * @module BitSource
 */

export class BitSource {
  #bytes: Int8Array;
  #bitOffset: number;
  #byteOffset: number;

  constructor(bytes: Int8Array) {
    this.#bytes = bytes;
    this.#bitOffset = 0;
    this.#byteOffset = 0;
  }

  public get bitOffset(): number {
    return this.#bitOffset;
  }

  public get byteOffset(): number {
    return this.#byteOffset;
  }

  public read(length: number): number {
    let result = 0;
    let bitOffset = this.#bitOffset;
    let byteOffset = this.#byteOffset;

    const bytes = this.#bytes;

    // First, read remainder from current byte
    if (bitOffset > 0) {
      const bitsLeft = 8 - bitOffset;
      const toRead = Math.min(length, bitsLeft);
      const bitsToNotRead = bitsLeft - toRead;
      const mask = (0xff >> (8 - toRead)) << bitsToNotRead;

      result = (bytes[byteOffset] & mask) >> bitsToNotRead;
      length -= toRead;
      bitOffset += toRead;

      if (bitOffset == 8) {
        bitOffset = 0;
        byteOffset++;
      }
    }

    // Next read whole bytes
    if (length > 0) {
      while (length >= 8) {
        result = (result << 8) | (bytes[byteOffset] & 0xff);
        byteOffset++;
        length -= 8;
      }

      // Finally read a partial byte
      if (length > 0) {
        const bitsToNotRead = 8 - length;
        const mask = (0xff >> bitsToNotRead) << bitsToNotRead;

        result = (result << length) | ((bytes[byteOffset] & mask) >> bitsToNotRead);
        bitOffset += length;
      }
    }

    this.#bitOffset = bitOffset;
    this.#byteOffset = byteOffset;

    return result;
  }

  public available(): number {
    return 8 * (this.#bytes.length - this.#byteOffset) - this.#bitOffset;
  }
}
