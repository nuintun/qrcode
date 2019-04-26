/**
 * @module Base64DecodeInputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

import InputStream from './InputStream';

export default class Base64DecodeInputStream extends InputStream {
  private buffer: number = 0;
  private stream: InputStream;
  private bufLength: number = 0;

  constructor(stream: InputStream) {
    super();

    this.stream = stream;
  }

  public readByte(): number {
    const stream: InputStream = this.stream;

    while (this.bufLength < 8) {
      const byte: number = stream.readByte();

      if (byte === -1) {
        if (this.bufLength === 0) {
          return -1;
        }

        throw `unexpected end of stream`;
      } else if (byte === 0x3d) {
        this.bufLength = 0;

        return -1;
      } else if (Base64DecodeInputStream.isWhitespace(byte)) {
        // ignore if whitespace.
        continue;
      }

      this.buffer = (this.buffer << 6) | Base64DecodeInputStream.decode(byte);
      this.bufLength += 6;
    }

    const byte: number = (this.buffer >>> (this.bufLength - 8)) & 0xff;

    this.bufLength -= 8;

    return byte;
  }

  private static isWhitespace(ch: number): boolean {
    // \v \t \r \n
    return ch === 0x0b || ch === 0x09 || ch === 0x0d || ch === 0x0a;
  }

  private static decode(ch: number): number {
    if (0x41 <= ch && ch <= 0x5a) {
      // A - Z
      return ch - 0x41;
    } else if (0x61 <= ch && ch <= 0x7a) {
      // a - z
      return ch - 0x61 + 26;
    } else if (0x30 <= ch && ch <= 0x39) {
      // 0 - 9
      return ch - 0x30 + 52;
    } else if (ch === 0x2b) {
      // +
      return 62;
    } else if (ch === 0x2f) {
      // /
      return 63;
    } else {
      throw `illegal char: ${String.fromCharCode(ch)}`;
    }
  }

  public close() {
    this.buffer = 0;
    this.bufLength = 0;
    this.stream = null;
  }
}
