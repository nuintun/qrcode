/**
 * @module Base64DecodeInputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as ASCII from './ASCII';
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
    const stream = this.stream;

    while (this.bufLength < 8) {
      const byte: number = stream.readByte();

      if (byte === -1) {
        if (this.bufLength === 0) {
          return -1;
        }

        throw `unexpected end of stream`;
      } else if (byte === ASCII.EQ) {
        this.bufLength = 0;

        return -1;
      } else if (Base64DecodeInputStream.isWhitespace(byte)) {
        // ignore if whitespace.
        continue;
      }

      this.buffer = (this.buffer << 6) | Base64DecodeInputStream.decode(byte);
      this.bufLength += 6;
    }

    const byte = (this.buffer >>> (this.bufLength - 8)) & 0xff;

    this.bufLength -= 8;

    return byte;
  }

  private static isWhitespace(ch: number): boolean {
    return ch == ASCII.VT || ch == ASCII.HT || ch == ASCII.CR || ch == ASCII.LF;
  }

  private static decode(ch: number): number {
    if (ASCII.A <= ch && ch <= ASCII.Z) {
      return ch - ASCII.A;
    } else if (ASCII.a <= ch && ch <= ASCII.z) {
      return ch - ASCII.a + 26;
    } else if (ASCII.ZERO <= ch && ch <= ASCII.NINE) {
      return ch - ASCII.ZERO + 52;
    } else if (ch === ASCII.ADD) {
      return 62;
    } else if (ch === ASCII.DIV) {
      return 63;
    } else {
      throw `illegal char: ${ch}`;
    }
  }

  public close() {
    this.buffer = 0;
    this.bufLength = 0;
    this.stream = null;
  }
}
