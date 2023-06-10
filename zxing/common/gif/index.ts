/**
 * @module index
 */

import { compress } from './lzw';
import { ByteStream } from './ByteStream';
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
    const stream = new ByteStream();
    const width = this.#width;
    const height = this.#height;

    // GIF signature
    stream.writeByte(0x47); // G
    stream.writeByte(0x49); // I
    stream.writeByte(0x46); // F
    stream.writeByte(0x38); // 8
    stream.writeByte(0x39); // 9
    stream.writeByte(0x61); // a

    // Logical screen descriptor
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeByte(0x80);
    stream.writeByte(0);
    stream.writeByte(0);

    // Global color palette: white
    stream.writeByte(0xff);
    stream.writeByte(0xff);
    stream.writeByte(0xff);

    // Global color palette: black
    stream.writeByte(0x00);
    stream.writeByte(0x00);
    stream.writeByte(0x00);

    // Image descriptor
    stream.writeByte(0x2c);
    stream.writeInt16(0);
    stream.writeInt16(0);
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeByte(0);

    compress(this.#pixels, 2, stream);

    // GIF terminator
    stream.writeByte(0x3b);

    return stream.bytes;
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
