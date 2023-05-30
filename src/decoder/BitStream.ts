/**
 * @module BitStream
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

export class BitStream {
  private bitOffset: number = 0;
  private byteOffset: number = 0;
  private bytes: Uint8ClampedArray;

  constructor(bytes: Uint8ClampedArray) {
    this.bytes = bytes;
  }

  public readBits(length: number): number | never {
    if (length < 1 || length > 32 || length > this.available()) {
      throw new Error(`can't read ${length} bits`);
    }

    let result = 0;

    // First, read remainder from current byte
    if (this.bitOffset > 0) {
      const bitsLeft = 8 - this.bitOffset;
      const toRead = length < bitsLeft ? length : bitsLeft;
      const bitsToNotRead = bitsLeft - toRead;
      const mask = (0xff >> (8 - toRead)) << bitsToNotRead;

      result = (this.bytes[this.byteOffset] & mask) >> bitsToNotRead;

      length -= toRead;

      this.bitOffset += toRead;

      if (this.bitOffset === 8) {
        this.bitOffset = 0;
        this.byteOffset++;
      }
    }

    // Next read whole bytes
    if (length > 0) {
      while (length >= 8) {
        result = (result << 8) | (this.bytes[this.byteOffset] & 0xff);

        this.byteOffset++;

        length -= 8;
      }

      // Finally read a partial byte
      if (length > 0) {
        const bitsToNotRead = 8 - length;
        const mask = (0xff >> bitsToNotRead) << bitsToNotRead;

        result = (result << length) | ((this.bytes[this.byteOffset] & mask) >> bitsToNotRead);

        this.bitOffset += length;
      }
    }

    return result;
  }

  public available(): number {
    return 8 * (this.bytes.length - this.byteOffset) - this.bitOffset;
  }
}
