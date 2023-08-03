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
  private width: number;
  private height: number;
  private foreground: RGB;
  private background: RGB;
  private pixels: number[] = [];

  constructor(
    width: number,
    height: number,
    { foreground = [0x00, 0x00, 0x00], background = [0xff, 0xff, 0xff] }: Colors = {}
  ) {
    this.width = width;
    this.height = height;
    this.foreground = foreground;
    this.background = background;
  }

  private encodeImpl(): number[] {
    const stream = new ByteStream();
    const { width, height, background, foreground } = this;

    // GIF signature: GIF89a
    stream.writeBytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

    // Logical screen descriptor
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeBytes([0x80, 0, 0]);

    // Global background color palette
    stream.writeBytes([background[0], background[1], background[2]]);
    // Global background color palette
    stream.writeBytes([foreground[0], foreground[1], foreground[2]]);

    // Image descriptor
    stream.writeByte(0x2c);
    stream.writeInt16(0);
    stream.writeInt16(0);
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeByte(0);

    compress(this.pixels, 2, stream);

    // GIF terminator
    stream.writeByte(0x3b);

    return stream.bytes;
  }

  public set(x: number, y: number, color: number): void {
    this.pixels[y * this.width + x] = color;
  }

  public toDataURL(): string {
    const bytes = this.encodeImpl();
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
