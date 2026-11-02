/**
 * @module GifImage
 */

import { toBase64 } from './utils/base64';
import { compress } from './utils/compress';
import { GifWriter } from './utils/GifWriter';

export type RGB = [
  // Red.
  R: number,
  // Green.
  G: number,
  // Blue.
  B: number
];

export interface Options {
  scale?: number;
  margin?: number;
  background?: RGB;
  foreground?: RGB;
}

// Logical screen descriptor fields:
// [global color table flag, background color index, pixel aspect ratio].
const LOGICAL_SCREEN_PREFIX = Uint8Array.of(0x80, 0, 0);

// GIF signature: GIF89a.
const GIF_SIGNATURE = Uint8Array.of(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

/**
 * A single-frame GIF89a encoder with a fixed two-color palette: index 0 for
 * the background and index 1 for the foreground. Pixel data is stored at the
 * original image size and expanded during LZW compression.
 */
export class GifImage {
  #scale: number;
  #width: number;
  #height: number;
  #margin: number;
  #background: RGB;
  #foreground: RGB;
  #pixels: Uint8Array;

  constructor(
    width: number,
    height: number,
    {
      // Scale.
      scale = 1,
      // Margin.
      margin = 0,
      // Background color.
      background = [0xff, 0xff, 0xff],
      // Foreground color.
      foreground = [0x00, 0x00, 0x00]
    }: Options = {}
  ) {
    this.#scale = scale;
    this.#width = width;
    this.#height = height;
    this.#margin = margin;
    this.#background = background;
    this.#foreground = foreground;
    this.#pixels = new Uint8Array(width * height);
  }

  #encode(): Uint8Array {
    const scale = this.#scale;
    const width = this.#width;
    const height = this.#height;
    const margin = this.#margin;
    const stream = new GifWriter();
    const background = this.#background;
    const foreground = this.#foreground;
    const outputWidth = width * scale + margin * 2;
    const outputHeight = height * scale + margin * 2;

    // GIF signature: GIF89a.
    stream.writeBytes(GIF_SIGNATURE);

    // Logical screen descriptor.
    stream.writeInt16(outputWidth);
    stream.writeInt16(outputHeight);
    stream.writeBytes(LOGICAL_SCREEN_PREFIX);

    // Global color table: background color followed by foreground color.
    stream.writeBytes(Uint8Array.of(...background, ...foreground));

    // Image descriptor.
    stream.writeByte(0x2c);
    stream.writeInt16(0);
    stream.writeInt16(0);
    stream.writeInt16(outputWidth);
    stream.writeInt16(outputHeight);
    stream.writeByte(0);

    // Compress pixel indices using GIF LZW.
    compress(this.#pixels, width, height, 2, scale, margin, stream);

    // GIF trailer: marks the end of the file.
    stream.writeByte(0x3b);

    return stream.bytes;
  }

  public setPixel(x: number, y: number, index: 0 | 1): void {
    this.#pixels[y * this.#width + x] = index;
  }

  public toDataURL(): string {
    return 'data:image/gif;base64,' + toBase64(this.#encode());
  }
}
