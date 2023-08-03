/**
 * @module ByteStream
 */

export class ByteStream {
  public bytes: number[] = [];

  public writeByte(value: number): void {
    this.bytes.push(value & 0xff);
  }

  public writeInt16(value: number): void {
    this.bytes.push(value & 0xff, (value >> 8) & 0xff);
  }

  public writeBytes(bytes: number[], offset: number = 0, length: number = bytes.length): void {
    const buffer = this.bytes;

    for (let i = 0; i < length; i++) {
      buffer.push(bytes[offset + i] & 0xff);
    }
  }
}
