/**
 * @module BitBuffer
 * @author nuintun
 * @author Kazuhiko Arase
 */

export class BitBuffer {
  public length: number = 0;
  private buffer: number[] = [];

  public putBit(bit: boolean): void {
    const { buffer, length } = this;

    if (buffer.length * 8 === length) {
      buffer.push(0);
    }

    if (bit) {
      buffer[(length / 8) >>> 0] |= 0x80 >>> length % 8;
    }

    this.length++;
  }

  public put(num: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  public at(index: number): number {
    const { buffer } = this;

    return buffer[index < 0 ? buffer.length + index : index];
  }

  public getBit(index: number): boolean {
    return ((this.buffer[(index / 8) >>> 0] >>> (7 - (index % 8))) & 1) === 1;
  }
}
