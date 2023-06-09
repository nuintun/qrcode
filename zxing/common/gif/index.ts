/**
 * @module index
 */

import { LZWTable } from './LZWTable';
import { BitStream } from './BitStream';
import { ByteArray } from './ByteArray';
import { ByteMatrix } from '/common/ByteMatrix';
import { Base64Stream } from './Base64Stream';

const { fromCharCode } = String;

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

    // GIF Signature
    buffer.writeByte(0x47); // G
    buffer.writeByte(0x49); // I
    buffer.writeByte(0x46); // F
    buffer.writeByte(0x38); // 8
    buffer.writeByte(0x37); // 7
    buffer.writeByte(0x61); // a

    // Screen Descriptor
    buffer.writeInt16(width);
    buffer.writeInt16(height);

    // 2bit
    buffer.writeByte(0x80);
    buffer.writeByte(0);
    buffer.writeByte(0);

    // Global color map: black
    buffer.writeByte(0x00);
    buffer.writeByte(0x00);
    buffer.writeByte(0x00);

    // Global color map: white
    buffer.writeByte(0xff);
    buffer.writeByte(0xff);
    buffer.writeByte(0xff);

    // Image Descriptor: ,
    buffer.writeByte(0x2c);

    buffer.writeInt16(0);
    buffer.writeInt16(0);
    buffer.writeInt16(width);
    buffer.writeInt16(height);

    buffer.writeByte(0);

    // Local color raster map
    const size = 2;
    const raster = this.#getLZWRaster(size);
    const rasterLength = raster.length;

    buffer.writeByte(size);

    let offset = 0;

    while (rasterLength - offset > 255) {
      buffer.writeByte(255);

      buffer.writeBytes(raster, offset, 255);

      offset += 255;
    }

    const length = rasterLength - offset;

    buffer.writeByte(length);

    buffer.writeBytes(raster, offset, length);

    buffer.writeByte(0x00);

    // GIF Terminator: ;
    buffer.writeByte(0x3b);

    return buffer.bytes;
  }

  public set(x: number, y: number, color: number): void {
    this.#pixels.set(x, y, color);
  }

  public toDataURL(): string {
    const bytes = this.#encode();
    const base64 = new Base64Stream();

    for (const byte of bytes) {
      base64.write(byte);
    }

    base64.close();

    return `data:image/gif;base64,${fromCharCode(...base64.bytes)}`;
  }
}
