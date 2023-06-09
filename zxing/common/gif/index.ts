/**
 * @module index
 */

import { LZWTable } from './LZWTable';
import { BitStream } from './BitStream';
import { ByteArray } from './ByteArray';
import { ByteMatrix } from '/common/ByteMatrix';
import { Base64Stream, fromCharCode } from './Base64Stream';

export class GIFImage {
  #pixels: ByteMatrix;

  constructor(width: number, height: number) {
    this.#pixels = new ByteMatrix(width, height);
  }

  #getLZWRaster(size: number): number[] {
    const dict = new LZWTable();
    const clearCode = 1 << size;
    const endCode = clearCode + 1;

    for (let i = 0; i < clearCode; i++) {
      dict.add(fromCharCode(i));
    }

    dict.add(fromCharCode(clearCode));
    dict.add(fromCharCode(endCode));

    let bitLength = size + 1;

    const pixels = this.#pixels;
    const stream = new BitStream();
    const { width, height } = pixels;

    // Clear code
    stream.write(clearCode, bitLength);

    let words = fromCharCode(pixels.get(0, 0));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Skip 0 0 pixel
        if (x > 0 || y > 0) {
          const character = fromCharCode(pixels.get(x, y));
          const newWords = words + character;

          if (dict.has(newWords)) {
            words = newWords;
          } else {
            stream.write(dict.indexOf(words), bitLength);

            // 4096 dict
            if (dict.size < 0x0fff) {
              if (dict.size === 1 << bitLength) {
                bitLength++;
              }

              dict.add(newWords);
            }

            words = character;
          }
        }
      }
    }

    stream.write(dict.indexOf(words), bitLength);
    // End code
    stream.write(endCode, bitLength);
    // Close
    stream.close();

    return stream.bytes;
  }

  #encode(): number[] {
    const buffer = new ByteArray();
    const { width, height } = this.#pixels;

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

    // Global color palette: black
    buffer.writeByte(0x00);
    buffer.writeByte(0x00);
    buffer.writeByte(0x00);

    // Global color palette: white
    buffer.writeByte(0xff);
    buffer.writeByte(0xff);
    buffer.writeByte(0xff);

    // Image descriptor
    buffer.writeByte(0x2c);
    buffer.writeInt16(0);
    buffer.writeInt16(0);
    buffer.writeInt16(width);
    buffer.writeInt16(height);
    buffer.writeByte(0);

    // Pixel data
    const size = 2;
    const raster = this.#getLZWRaster(size);
    const { length } = raster;

    buffer.writeByte(size);

    let offset = 0;

    while (length - offset > 255) {
      buffer.writeByte(255);
      buffer.writeBytes(raster, offset, 255);

      offset += 255;
    }

    const remain = length - offset;

    buffer.writeByte(remain);
    buffer.writeBytes(raster, offset, remain);
    buffer.writeByte(0x00);

    // GIF terminator
    buffer.writeByte(0x3b);

    return buffer.bytes;
  }

  public set(x: number, y: number, color: number): void {
    this.#pixels.set(x, y, color);
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
