/**
 * @module GIF Image (B/W)
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as ASCII from '../io/ASCII';
import * as Base64 from '../io/Base64';
import OutputStream from '../io/OutputStream';
import ByteArrayOutputStream from '../io/ByteArrayOutputStream';

class LZWTable {
  private size: number = 0;
  private map: { [key: string]: number } = {};

  public add(key: string): void {
    if (!this.contains(key)) {
      this.map[key] = this.size;
      this.size += 1;
    }
  }

  public getSize(): number {
    return this.size;
  }

  public indexOf(key: string): number {
    return this.map[key];
  }

  public contains(key: string): boolean {
    return this.map.hasOwnProperty(key);
  }
}

class BitOutputStream {
  private output: OutputStream;
  private bitLength: number;
  private bitBuffer: number;

  constructor(output: OutputStream) {
    this.output = output;
    this.bitLength = 0;
  }

  public write(data: number, length: number): void {
    if (data >>> length !== 0) {
      throw 'length overflow';
    }

    while (this.bitLength + length >= 8) {
      this.output.writeByte(0xff & ((data << this.bitLength) | this.bitBuffer));

      length -= 8 - this.bitLength;
      data >>>= 8 - this.bitLength;

      this.bitBuffer = 0;
      this.bitLength = 0;
    }

    this.bitBuffer = (data << this.bitLength) | this.bitBuffer;
    this.bitLength = this.bitLength + length;
  }

  public flush(): void {
    if (this.bitLength > 0) {
      this.output.writeByte(this.bitBuffer);
    }

    this.output.flush();
  }

  public close(): void {
    this.flush();
    this.output.close();
  }
}

export default class GIFImage {
  private width: number;
  private height: number;
  private data: number[];

  constructor(width: number, height: number) {
    this.data = [];
    this.width = width;
    this.height = height;

    const size: number = width * height;

    for (let i: number = 0; i < size; i++) {
      this.data.push(0);
    }
  }

  public setPixel(x: number, y: number, pixel: number): void {
    if (x < 0 || this.width <= x) throw `illegal x axis: ${x}`;

    if (y < 0 || this.height <= y) throw `illegal y axis: ${y}`;

    this.data[y * this.width + x] = pixel;
  }

  public getPixel(x: number, y: number): number {
    if (x < 0 || this.width <= x) throw `illegal x axis: ${x}`;

    if (y < 0 || this.height <= y) throw `illegal x axis: ${y}`;

    return this.data[y * this.width + x];
  }

  public write(output: OutputStream): void {
    // GIF Signature
    output.writeByte(ASCII.G);
    output.writeByte(ASCII.I);
    output.writeByte(ASCII.F);
    output.writeByte(ASCII.EIGHT);
    output.writeByte(ASCII.SEVEN);
    output.writeByte(ASCII.a);

    // Screen Descriptor
    this.writeWord(output, this.width);
    this.writeWord(output, this.height);

    output.writeByte(0x80); // 2bit
    output.writeByte(0);
    output.writeByte(0);

    // Global Color Map
    // black
    output.writeByte(0x00);
    output.writeByte(0x00);
    output.writeByte(0x00);

    // white
    output.writeByte(0xff);
    output.writeByte(0xff);
    output.writeByte(0xff);

    // Image Descriptor
    output.writeByte(ASCII.COMMA);

    this.writeWord(output, 0);
    this.writeWord(output, 0);
    this.writeWord(output, this.width);
    this.writeWord(output, this.height);

    output.writeByte(0);

    // Local Color Map
    // Raster Data
    const lzwMinCodeSize: number = 2;
    const raster: number[] = this.getLZWRaster(lzwMinCodeSize);

    output.writeByte(lzwMinCodeSize);

    let offset: number = 0;

    while (raster.length - offset > 255) {
      output.writeByte(255);

      this.writeBytes(output, raster, offset, 255);

      offset += 255;
    }

    output.writeByte(raster.length - offset);

    this.writeBytes(output, raster, offset, raster.length - offset);

    output.writeByte(0x00);

    // GIF Terminator
    output.writeByte(ASCII.SEMI);
  }

  private getLZWRaster(lzwMinCodeSize: number): number[] {
    const clearCode: number = 1 << lzwMinCodeSize;
    const endCode: number = (1 << lzwMinCodeSize) + 1;

    // Setup LZWTable
    const table: LZWTable = new LZWTable();

    for (let i: number = 0; i < clearCode; i++) {
      table.add(String.fromCharCode(i));
    }

    table.add(String.fromCharCode(clearCode));
    table.add(String.fromCharCode(endCode));

    const byteOutput: ByteArrayOutputStream = new ByteArrayOutputStream();
    const bitOutput: BitOutputStream = new BitOutputStream(byteOutput);

    let bitLength: number = lzwMinCodeSize + 1;

    try {
      // clear code
      bitOutput.write(clearCode, bitLength);

      let dataIndex: number = 0;
      let s: string = String.fromCharCode(this.data[dataIndex]);

      dataIndex += 1;

      while (dataIndex < this.data.length) {
        const c: string = String.fromCharCode(this.data[dataIndex]);

        dataIndex += 1;

        if (table.contains(s + c)) {
          s = s + c;
        } else {
          bitOutput.write(table.indexOf(s), bitLength);

          if (table.getSize() < 0xfff) {
            if (table.getSize() === 1 << bitLength) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOutput.write(table.indexOf(s), bitLength);

      // end code
      bitOutput.write(endCode, bitLength);
    } finally {
      bitOutput.close();
    }

    return byteOutput.toByteArray();
  }

  private writeWord(output: OutputStream, i: number) {
    output.writeByte(i & 0xff);
    output.writeByte((i >>> 8) & 0xff);
  }

  private writeBytes(output: OutputStream, bytes: number[], off: number, length: number) {
    for (let i: number = 0; i < length; i++) {
      output.writeByte(bytes[i + off]);
    }
  }

  public toDataURL(): string {
    const output: ByteArrayOutputStream = new ByteArrayOutputStream();

    this.write(output);

    const bytes: number[] = Base64.encode(output.toByteArray());

    output.close();

    const length: number = bytes.length;
    let url: string = 'data:image/gif;base64,';

    for (let i: number = 0; i < length; i++) {
      url += String.fromCharCode(bytes[i]);
    }

    return url;
  }
}
