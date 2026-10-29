/**
 * @module GifImage
 */

import { compress, GifWriter, ReadRow } from './utils';

export type RGB = [
  // Red.
  R: number,
  // Green.
  G: number,
  // Blue.
  B: number
];

export type { ReadRow };

export interface Colors {
  foreground?: RGB;
  background?: RGB;
}

// Maximum chunk size for String.fromCharCode.apply(), kept below the argument limit.
const CHUNK_SIZE = 0x2000;

// Cache String.fromCharCode for Base64 encoding.
const { fromCharCode } = String;

// Logical screen descriptor fields:
// [global color table flag, background color index, pixel aspect ratio].
const LOGICAL_SCREEN_PREFIX = Uint8Array.of(0x80, 0, 0);

// GIF signature: GIF89a.
const GIF_SIGNATURE = Uint8Array.of(0x47, 0x49, 0x46, 0x38, 0x39, 0x61);

// Base64 alphabet: A-Z, a-z, 0-9, +, /.
const BASE64_CODES = Uint8Array.from(
  // Alphabet
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
  char => {
    return char.charCodeAt(0);
  }
);

/**
 * Encodes bytes as a standard Base64 string with '=' padding. Uses the native
 * `Uint8Array.prototype.toBase64()` when available; otherwise encodes in chunks
 * to avoid excessive function arguments and per-character string concatenation.
 */
function toBase64(bytes: Uint8Array): string {
  if (bytes.toBase64 != null) {
    return bytes.toBase64();
  }

  let offset = 0;
  let base64 = '';

  const byteLength = bytes.length;
  const remainder = byteLength % 3;
  const size = (((byteLength + 2) / 3) | 0) * 4;
  const codes = new Uint8Array(size);

  for (let i = 0; i < byteLength - remainder; i += 3) {
    const group = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    codes[offset++] = BASE64_CODES[group >>> 18];
    codes[offset++] = BASE64_CODES[(group >>> 12) & 63];
    codes[offset++] = BASE64_CODES[(group >>> 6) & 63];
    codes[offset++] = BASE64_CODES[group & 63];
  }

  // Encode the remaining 1 or 2 bytes with '=' padding.
  if (remainder > 0) {
    const i = byteLength - remainder;
    const group = (bytes[i] << 16) | (remainder === 2 ? bytes[i + 1] << 8 : 0);

    codes[offset++] = BASE64_CODES[group >>> 18];
    codes[offset++] = BASE64_CODES[(group >>> 12) & 63];
    codes[offset++] = remainder === 2 ? BASE64_CODES[(group >>> 6) & 63] : 0x3d;
    codes[offset++] = 0x3d;
  }

  for (let i = 0; i < size; i += CHUNK_SIZE) {
    base64 += fromCharCode(...codes.subarray(i, i + CHUNK_SIZE));
  }

  return base64;
}

/**
 * A single-frame GIF89a encoder with a fixed two-color palette: index 0 for
 * the background and index 1 for the foreground. Pixel rows are pulled from
 * `readRow` while encoding, so no full pixel image is materialized in memory.
 * Encoded as a data URL on demand.
 */
export class GifImage {
  #width: number;
  #height: number;
  #background: RGB;
  #foreground: RGB;
  #readRow: ReadRow;

  constructor(
    width: number,
    height: number,
    readRow: ReadRow,
    { foreground = [0x00, 0x00, 0x00], background = [0xff, 0xff, 0xff] }: Colors = {}
  ) {
    this.#width = width;
    this.#height = height;
    this.#readRow = readRow;
    this.#foreground = foreground;
    this.#background = background;
  }

  #encode(): Uint8Array {
    const width = this.#width;
    const height = this.#height;
    const stream = new GifWriter();
    const background = this.#background;
    const foreground = this.#foreground;

    stream.writeBytes(GIF_SIGNATURE);

    // Logical screen descriptor.
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeBytes(LOGICAL_SCREEN_PREFIX);

    // Global color table: background color followed by foreground color.
    stream.writeBytes(Uint8Array.of(...background, ...foreground));

    // Image descriptor.
    stream.writeByte(0x2c);
    stream.writeInt16(0);
    stream.writeInt16(0);
    stream.writeInt16(width);
    stream.writeInt16(height);
    stream.writeByte(0);

    // Compress pixel indices using GIF LZW.
    compress(width, height, 2, stream, this.#readRow);

    // GIF trailer: marks the end of the file.
    stream.writeByte(0x3b);

    return stream.bytes;
  }

  public toDataURL(): string {
    return 'data:image/gif;base64,' + toBase64(this.#encode());
  }
}
