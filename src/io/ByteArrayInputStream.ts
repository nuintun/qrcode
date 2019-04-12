/**
 * @module ByteArrayInputStream
 * @author nuintun
 * @author Kazuhiko Arase
 */

import InputStream from './InputStream';

export default class ByteArrayInputStream extends InputStream {
  private pos: number = 0;
  private bytes: number[];

  constructor(bytes: number[]) {
    super();

    this.bytes = bytes;
  }

  public readByte(): number {
    if (this.pos < this.bytes.length) {
      const byte: number = this.bytes[this.pos];

      this.pos += 1;

      return byte;
    }

    return -1;
  }

  public close(): void {
    this.pos = 0;
    this.bytes = [];
  }
}
