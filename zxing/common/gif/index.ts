/**
 * @module index
 */

import { compress } from './lzw';
import { ByteStream } from './ByteStream';
import { Base64Stream, fromCharCode } from './Base64Stream';

export type RGB = [
  // Red
  R: number,
  // Green
  G: number,
  // Blue
  B: number
];

export interface Colors {
  foreground?: RGB;
  background?: RGB;
}

export class GIFImage {
  #width: number;
  #height: number;
  #foreground: RGB;
  #background: RGB;
  #pixels: number[] = [];

  constructor(
    width: number,
    height: number,
    { foreground = [0x00, 0x00, 0x00], background = [0xff, 0xff, 0xff] }: Colors = {}
  ) {
    this.#width = width;
    this.#height = height;
    this.#foreground = foreground;
    this.#background = background;
  }

  #encode(): number[] {
    const stream = new ByteStream();
    const width = this.#width;
    const height = this.#height;
    const foreground = this.#foreground;
    const background = this.#background;

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

    // Global background color palette
    stream.writeByte(background[0] & 0xff);
    stream.writeByte(background[1] & 0xff);
    stream.writeByte(background[2] & 0xff);

    // Global background color palette
    stream.writeByte(foreground[0] & 0xff);
    stream.writeByte(foreground[1] & 0xff);
    stream.writeByte(foreground[2] & 0xff);

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
