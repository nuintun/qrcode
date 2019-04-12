/**
 * @module Base64EncodeOutputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as ASCII from './ASCII';
import OutputStream from './OutputStream';

export default class Base64EncodeOutputStream extends OutputStream {
  private buffer = 0;
  private length = 0;
  private bufLength = 0;
  private stream: OutputStream;

  constructor(stream: OutputStream) {
    super();

    this.stream = stream;
  }

  public writeByte(byte: number): void {
    this.buffer = (this.buffer << 8) | (byte & 0xff);
    this.bufLength += 8;
    this.length += 1;

    while (this.bufLength >= 6) {
      this.writeEncoded(this.buffer >>> (this.bufLength - 6));

      this.bufLength -= 6;
    }
  }

  /**
   * @override
   */
  public flush(): void {
    if (this.bufLength > 0) {
      this.writeEncoded(this.buffer << (6 - this.bufLength));

      this.buffer = 0;
      this.bufLength = 0;
    }

    if (this.length % 3 != 0) {
      // padding
      const pad: number = 3 - (this.length % 3);

      for (let i: number = 0; i < pad; i++) {
        this.stream.writeByte(ASCII.EQ);
      }
    }
  }

  private writeEncoded(byte: number): void {
    this.stream.writeByte(Base64EncodeOutputStream.encode(byte & 0x3f));
  }

  private static encode(ch: number): number {
    if (ch >= 0) {
      if (ch < 26) {
        return ASCII.A + ch;
      } else if (ch < 52) {
        return ASCII.a + (ch - 26);
      } else if (ch < 62) {
        return ASCII.ZERO + (ch - 52);
      } else if (ch === 62) {
        return ASCII.ADD;
      } else if (ch === 63) {
        return ASCII.DIV;
      }
    }

    throw 'unknow char:' + ch;
  }
}
