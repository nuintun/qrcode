/**
 * @module index
 */

import { compress } from './lzw';
import { ByteArray } from './ByteArray';
import { Base64Stream, fromCharCode } from './Base64Stream';

export class GIFImage {
  #width: number;
  #height: number;
  #pixels: number[] = [];

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;
  }

  #encode(): number[] {
    const buffer = new ByteArray();
    const width = this.#width;
    const height = this.#height;

    // GIF signature
    buffer.writeByte(0x47); // G
    buffer.writeByte(0x49); // I
    buffer.writeByte(0x46); // F
    buffer.writeByte(0x38); // 8
    buffer.writeByte(0x39); // 9
    buffer.writeByte(0x61); // a

    // Logical screen descriptor
    buffer.writeInt16(width);
    buffer.writeInt16(height);
    buffer.writeByte(0x80);
    buffer.writeByte(0);
    buffer.writeByte(0);

    // Global color palette: white
    buffer.writeByte(0xff);
    buffer.writeByte(0xff);
    buffer.writeByte(0xff);

    // Global color palette: black
    buffer.writeByte(0x00);
    buffer.writeByte(0x00);
    buffer.writeByte(0x00);

    // Image descriptor
    buffer.writeByte(0x2c);
    buffer.writeInt16(0);
    buffer.writeInt16(0);
    buffer.writeInt16(width);
    buffer.writeInt16(height);
    buffer.writeByte(0);

    compress(this.#pixels, 2, buffer);

    // GIF terminator
    buffer.writeByte(0x3b);

    return buffer.bytes;
  }

  public set(x: number, y: number, color: number): void {
    this.#pixels[y * this.#width + x] = color;
  }

  public toDataURL(): string {
    const bytes = this.#encode();
    const stream = new Base64Stream();

    for (const byte of bytes) {
      stream.write(byte);
    }

    stream.close();

    const base64 = stream.bytes;

    let url = 'data:image/gif;base64,';

    for (const byte of base64) {
      url += fromCharCode(byte);
    }

    return url;
  }
}
