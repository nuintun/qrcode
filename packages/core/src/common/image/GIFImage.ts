/**
 * @module GIFImage
 */

import { compress } from './utils/lzw';
import { ByteStream } from './utils/ByteStream';

export type RGB = [
  // Red.
  R: number,
  // Green.
  G: number,
  // Blue.
  B: number
];

export interface Colors {
  foreground?: RGB;
  background?: RGB;
}

// Chunk size for fromCharCode.apply, far below the ~65535 argument stack limit.
const CHUNK_SIZE = 0x2000;

// String.fromCharCode.
const { fromCharCode } = String;

// Logical screen descriptor prefix: global color table flag, color resolution,
// sort flag, and global color table size.
const LOGICAL_SCREEN_PREFIX = Uint8Array.of(0x80, 0, 0);

// GIF signature: GIF89a.
const GIF_SIGNATURE = Uint8Array.of(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

// Base64 chars: A-Z, a-z, 0-9, +, /.
const BASE64_CODES = Uint8Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', char => {
  return char.charCodeAt(0);
});

/**
 * Encodes bytes to a standard base64 string (with '=' padding) via a 3-to-4
 * char-code lookup, assembled in chunks to avoid per-char string concatenation.
 */
function toBase64(bytes: Uint8Array): string {
  if (bytes.toBase64 != null) {
    return bytes.toBase64();
  }

  let offset = 0;
  let base64 = '';

  const length = bytes.length;
  const remainder = length % 3;
  const codes = new Uint8Array((((length + 2) / 3) | 0) * 4);

  for (let i = 0; i + 2 < length; i += 3) {
    const group = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    codes[offset++] = BASE64_CODES[group >>> 18];
    codes[offset++] = BASE64_CODES[(group >>> 12) & 63];
    codes[offset++] = BASE64_CODES[(group >>> 6) & 63];
    codes[offset++] = BASE64_CODES[group & 63];
  }

  // Last 1 or 2 bytes with '=' padding.
  if (remainder > 0) {
    const i = length - remainder;
    const group = (bytes[i] << 16) | (remainder === 2 ? bytes[i + 1] << 8 : 0);

    codes[offset++] = BASE64_CODES[group >>> 18];
    codes[offset++] = BASE64_CODES[(group >>> 12) & 63];
    codes[offset++] = remainder === 2 ? BASE64_CODES[(group >>> 6) & 63] : 0x3d;
    codes[offset++] = 0x3d;
  }

  for (let i = 0; i < codes.length; i += CHUNK_SIZE) {
    base64 += fromCharCode.apply(null, codes.subarray(i, i + CHUNK_SIZE) as unknown as number[]);
  }

  return base64;
}

/**
 *  A single frame GIF89a image with a fixed two-color palette (index 0 for
 * background, index 1 for foreground), encoded to a data URL on demand.
 */
export class GIFImage {
  #width: number;
  #height: number;
  #background: RGB;
  #foreground: RGB;
  #pixels: Uint8Array;

  constructor(
    width: number,
    height: number,
    { foreground = [0x00, 0x00, 0x00], background = [0xff, 0xff, 0xff] }: Colors = {}
  ) {
    this.#width = width;
    this.#height = height;
    this.#foreground = foreground;
    this.#background = background;
    this.#pixels = new Uint8Array(width * height);
  }

  #encode(): Uint8Array {
    const width = this.#width;
    const height = this.#height;
    const stream = new ByteStream();
    const background = this.#background;
    const foreground = this.#foreground;

    stream.writeBytes(GIF_SIGNATURE);

    // Logical screen descriptor.
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeBytes(LOGICAL_SCREEN_PREFIX);

    // Global color table: background followed by foreground.
    stream.writeBytes(
      Uint8Array.of(
        // background
        background[0],
        background[1],
        background[2],
        // foreground
        foreground[0],
        foreground[1],
        foreground[2]
      )
    );

    // Image descriptor.
    stream.writeByte(0x2c);
    stream.writeInt16(0);
    stream.writeInt16(0);
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeByte(0);

    // Compress pixels to stream.
    compress(this.#pixels, 2, stream);

    // GIF terminator.
    stream.writeByte(0x3b);

    return stream.bytes;
  }

  public toDataURL(): string {
    return 'data:image/gif;base64,' + toBase64(this.#encode());
  }

  public fillRect(x: number, y: number, width: number, height: number, color: number): void {
    const stride = this.#width;
    const pixels = this.#pixels;

    for (let row = 0, base = y * stride + x; row < height; row++, base += stride) {
      pixels.fill(color, base, base + width);
    }
  }
}
