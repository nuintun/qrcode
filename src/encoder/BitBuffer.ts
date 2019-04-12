/**
 * @class BitBuffer
 * @author nuintun
 * @author Kazuhiko Arase
 */

export default class BitBuffer {
  private length: number;
  private buffer: number[];

  public constructor() {
    this.length = 0;
    this.buffer = [];
  }

  public getBuffer(): number[] {
    return this.buffer;
  }

  public getLengthInBits(): number {
    return this.length;
  }

  public toString(): string {
    let buffer: string = '';
    const length: number = this.getLengthInBits();

    for (let i: number = 0; i < length; i++) {
      buffer += this.getBit(i) ? '1' : '0';
    }

    return buffer;
  }

  private getBit(index: number): boolean {
    return ((this.buffer[~~(index / 8)] >>> (7 - (index % 8))) & 1) === 1;
  }

  public put(num: number, length: number): void {
    for (let i: number = 0; i < length; i += 1) {
      this.putBit(((num >>> (length - i - 1)) & 1) === 1);
    }
  }

  public putBit(bit: boolean): void {
    if (this.length === this.buffer.length * 8) {
      this.buffer.push(0);
    }

    if (bit) {
      this.buffer[~~(this.length / 8)] |= 0x80 >>> this.length % 8;
    }

    this.length++;
  }
}
