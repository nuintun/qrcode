/**
 * @module index
 */

import { LZWTable } from './LZWTable';
import { BitStream } from './BitStream';
import { ByteMatrix } from '/common/ByteMatrix';
import { ByteArray } from './ByteArray';
import { Base64Stream } from './Base64Stream';

const { fromCharCode } = String;

export class GIFImage {
  #pixels: ByteMatrix;

  constructor(width: number, height: number) {
    this.#pixels = new ByteMatrix(width, height);
  }

  #getLZWRaster(size: number): number[] {
    const clearCode = 1 << size;
    const table = new LZWTable();
    const endCode = clearCode + 1;

    for (let i = 0; i < clearCode; i++) {
      table.add(fromCharCode(i));
    }

    table.add(fromCharCode(clearCode));
    table.add(fromCharCode(endCode));

    let bitLength = size + 1;

    const pixels = this.#pixels;
    const stream = new BitStream();
    const { width, height } = this.#pixels;

    // Clear code
    stream.write(clearCode, bitLength);

    let word = fromCharCode(pixels.get(0, 0) & 0xff);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Skip 0 0 pixel
        if (x > 0 || y > 0) {
          const char = fromCharCode(pixels.get(x, y) & 0xff);

          if (table.has(word + char)) {
            word += char;
          } else {
            stream.write(table.indexOf(word), bitLength);

            // 4096 dict
            if (table.size < 0x0fff) {
              if (table.size === 1 << bitLength) {
                bitLength++;
              }

              table.add(width + char);
            }

            word = char;
          }
        }
      }
    }

    stream.write(table.indexOf(word), bitLength);
    // End code
    stream.write(endCode, bitLength);
    // Flush
    stream.flush();

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
    const base64 = new Base64Stream();

    base64.writeBytes(this.#encode());

    const { bytes } = base64;

    return `data:image/gif;base64,${btoa(fromCharCode.apply(null, bytes))}`;
  }
}
