/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import BitArray from './BitArray';
import Arrays from '../util/Arrays';
import System from '../util/System';
import StringBuilder from '../util/StringBuilder';
import IllegalArgumentException from '../IllegalArgumentException';

/**
 * <p>Represents a 2D matrix of bits. In function arguments below, and throughout the common
 * module, x is the column position, and y is the row position. The ordering is always x, y.
 * The origin is at the top-left.</p>
 *
 * <p>Internally the bits are represented in a 1-D array of 32-bit ints. However, each row begins
 * with a new int. This is done intentionally so that we can copy out a row into a BitArray very
 * efficiently.</p>
 *
 * <p>The ordering of bits is row-major. Within each int, the least significant bits are used first,
 * meaning they represent lower x values. This is compatible with BitArray's implementation.</p>
 *
 * @author Sean Owen
 * @author dswitkin@google.com (Daniel Switkin)
 */
export default class BitMatrix {
  private width: number;
  private height: number;
  private rowSize: number;
  private bits: Int32Array;

  /**
   * @constructor
   * Creates an empty {@link BitMatrix}.
   *
   * @param width bit matrix width
   * @param height bit matrix height
   * @param rowSize row size
   * @param bits bits
   */
  public constructor(width: number, height?: number, rowSize?: number, bits?: Int32Array) {
    if (height == null) {
      height = width;
    }

    this.width = width;
    this.height = height;

    if (width < 1 || height < 1) {
      throw new IllegalArgumentException('Both dimensions must be greater than 0');
    }

    if (rowSize == null) {
      rowSize = Math.floor((width + 31) / 32);
    }

    this.rowSize = rowSize;

    if (bits == null) {
      this.bits = new Int32Array(this.rowSize * this.height);
    }
  }

  /**
   * Interprets a 2D array of booleans as a {@code BitMatrix}, where "true" means an "on" bit.
   *
   * @param image bits of the image, as a row-major 2D array. Elements are arrays representing rows
   * @return {@code BitMatrix} representation of image
   */
  public static parseFromBooleanArray(image: boolean[][]): BitMatrix {
    const height: number = image.length;
    const width: number = image[0].length;
    const bits: BitMatrix = new BitMatrix(width, height);

    for (let i: number = 0; i < height; i++) {
      const imageI: boolean[] = image[i];

      for (let j: number = 0; j < width; j++) {
        if (imageI[j]) {
          bits.set(j, i);
        }
      }
    }

    return bits;
  }

  public static parseFromString(stringRepresentation: string, setString: string, unsetString: string): BitMatrix {
    if (stringRepresentation == null) {
      throw new IllegalArgumentException('stringRepresentation cannot be null');
    }

    const bits: boolean[] = new Array<boolean>(stringRepresentation.length);
    let bitsPos: number = 0;
    let rowStartPos: number = 0;
    let rowLength: number = -1;
    let nRows: number = 0;
    let pos: number = 0;

    while (pos < stringRepresentation.length) {
      if (stringRepresentation.charAt(pos) === '\n' || stringRepresentation.charAt(pos) === '\r') {
        if (bitsPos > rowStartPos) {
          if (rowLength === -1) {
            rowLength = bitsPos - rowStartPos;
          } else if (bitsPos - rowStartPos !== rowLength) {
            throw new IllegalArgumentException('row lengths do not match');
          }

          rowStartPos = bitsPos;
          nRows++;
        }

        pos++;
      } else if (stringRepresentation.substring(pos, pos + setString.length) === setString) {
        pos += setString.length;
        bits[bitsPos] = true;
        bitsPos++;
      } else if (stringRepresentation.substring(pos, pos + unsetString.length) === unsetString) {
        pos += unsetString.length;
        bits[bitsPos] = false;
        bitsPos++;
      } else {
        throw new IllegalArgumentException('illegal character encountered: ' + stringRepresentation.substring(pos));
      }
    }

    // no EOL at end?
    if (bitsPos > rowStartPos) {
      if (rowLength === -1) {
        rowLength = bitsPos - rowStartPos;
      } else if (bitsPos - rowStartPos !== rowLength) {
        throw new IllegalArgumentException('row lengths do not match');
      }

      nRows++;
    }

    const matrix = new BitMatrix(rowLength, nRows);

    for (let i: number = 0; i < bitsPos; i++) {
      if (bits[i]) {
        matrix.set(Math.floor(i % rowLength), Math.floor(i / rowLength));
      }
    }

    return matrix;
  }

  /**
   * <p>Gets the requested bit, where true means black.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   * @return value of given bit in matrix
   */
  public get(x: number, y: number): boolean {
    const offset: number = y * this.rowSize + Math.floor(x / 32);

    return ((this.bits[offset] >>> (x & 0x1f)) & 1) !== 0;
  }

  /**
   * <p>Sets the given bit to true.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   */
  public set(x: number, y: number): void {
    const offset: number = y * this.rowSize + Math.floor(x / 32);

    this.bits[offset] |= (1 << (x & 0x1f)) & 0xffffffff;
  }

  public unset(x: number, y: number): void {
    const offset: number = y * this.rowSize + Math.floor(x / 32);

    this.bits[offset] &= ~((1 << (x & 0x1f)) & 0xffffffff);
  }

  /**
   * <p>Flips the given bit.</p>
   *
   * @param x The horizontal component (i.e. which column)
   * @param y The vertical component (i.e. which row)
   */
  public flip(x: number, y: number): void {
    const offset: number = y * this.rowSize + Math.floor(x / 32);

    this.bits[offset] ^= (1 << (x & 0x1f)) & 0xffffffff;
  }

  /**
   * Exclusive-or (XOR): Flip the bit in this {@code BitMatrix} if the corresponding
   * mask bit is set.
   *
   * @param mask XOR mask
   */
  public xor(mask: BitMatrix): void {
    if (this.width !== mask.getWidth() || this.height !== mask.getHeight() || this.rowSize !== mask.getRowSize()) {
      throw new IllegalArgumentException('input matrix dimensions do not match');
    }

    const bits: Int32Array = this.bits;
    const rowSize: number = this.rowSize;
    const rowArray: BitArray = new BitArray(Math.floor(this.width / 32) + 1);

    for (let y: number = 0, height: number = this.height; y < height; y++) {
      const offset: number = y * rowSize;
      const row: Int32Array = mask.getRow(y, rowArray).getBitArray();

      for (let x: number = 0; x < rowSize; x++) {
        bits[offset + x] ^= row[x];
      }
    }
  }

  /**
   * Clears all bits (sets to false).
   */
  public clear(): void {
    const bits: Int32Array = this.bits;
    const max: number = bits.length;

    for (let i: number = 0; i < max; i++) {
      bits[i] = 0;
    }
  }

  /**
   * <p>Sets a square region of the bit matrix to true.</p>
   *
   * @param left The horizontal position to begin at (inclusive)
   * @param top The vertical position to begin at (inclusive)
   * @param width The width of the region
   * @param height The height of the region
   */
  public setRegion(left: number, top: number, width: number, height: number): void {
    if (top < 0 || left < 0) {
      throw new IllegalArgumentException('Left and top must be nonnegative');
    }

    if (height < 1 || width < 1) {
      throw new IllegalArgumentException('Height and width must be at least 1');
    }

    const right: number = left + width;
    const bottom: number = top + height;

    if (bottom > this.height || right > this.width) {
      throw new IllegalArgumentException('The region must fit inside the matrix');
    }

    const bits: Int32Array = this.bits;
    const rowSize: number = this.rowSize;

    for (let y = top; y < bottom; y++) {
      const offset: number = y * rowSize;

      for (let x: number = left; x < right; x++) {
        bits[offset + Math.floor(x / 32)] |= (1 << (x & 0x1f)) & 0xffffffff;
      }
    }
  }

  /**
   * A fast method to retrieve one row of data from the matrix as a BitArray.
   *
   * @param y The row to retrieve
   * @param row An optional caller-allocated BitArray, will be allocated if null or too small
   * @return The resulting BitArray - this reference should always be used even when passing
   *         your own row
   */
  public getRow(y: number, row?: BitArray): BitArray {
    if (row == null || row.getSize() < this.width) {
      row = new BitArray(this.width);
    } else {
      row.clear();
    }

    const bits: Int32Array = this.bits;
    const rowSize: number = this.rowSize;
    const offset: number = y * rowSize;

    for (let x: number = 0; x < rowSize; x++) {
      row.setBulk(x * 32, bits[offset + x]);
    }

    return row;
  }

  /**
   * @param y row to set
   * @param row {@link BitArray} to copy from
   */
  public setRow(y: number, row: BitArray): void {
    System.arraycopy(row.getBitArray(), 0, this.bits, y * this.rowSize, this.rowSize);
  }

  /**
   * Modifies this {@code BitMatrix} to represent the same but rotated 180 degrees
   */
  public rotate180(): void {
    const width: number = this.getWidth();
    const height: number = this.getHeight();

    let topRow: BitArray = new BitArray(width);
    let bottomRow: BitArray = new BitArray(width);

    for (let i: number = 0, length: number = Math.floor((height + 1) / 2); i < length; i++) {
      topRow = this.getRow(i, topRow);
      bottomRow = this.getRow(height - 1 - i, bottomRow);

      topRow.reverse();
      bottomRow.reverse();

      this.setRow(i, bottomRow);
      this.setRow(height - 1 - i, topRow);
    }
  }

  /**
   * This is useful in detecting the enclosing rectangle of a 'pure' barcode.
   *
   * @return {@code left,top,width,height} enclosing rectangle of all 1 bits, or null if it is all white
   */
  public getEnclosingRectangle(): Int32Array {
    const bits: Int32Array = this.bits;
    const width: number = this.width;
    const height: number = this.height;
    const rowSize: number = this.rowSize;

    let left: number = width;
    let top: number = height;
    let right: number = -1;
    let bottom: number = -1;

    for (let y: number = 0; y < height; y++) {
      for (let x32: number = 0; x32 < rowSize; x32++) {
        const theBits: number = bits[y * rowSize + x32];

        if (theBits !== 0) {
          if (y < top) {
            top = y;
          }

          if (y > bottom) {
            bottom = y;
          }

          if (x32 * 32 < left) {
            let bit = 0;

            while (((theBits << (31 - bit)) & 0xffffffff) === 0) {
              bit++;
            }

            if (x32 * 32 + bit < left) {
              left = x32 * 32 + bit;
            }
          }

          if (x32 * 32 + 31 > right) {
            let bit = 31;

            while (theBits >>> bit === 0) {
              bit--;
            }

            if (x32 * 32 + bit > right) {
              right = x32 * 32 + bit;
            }
          }
        }
      }
    }

    if (right < left || bottom < top) {
      return null;
    }

    return Int32Array.from([left, top, right - left + 1, bottom - top + 1]);
  }

  /**
   * This is useful in detecting a corner of a 'pure' barcode.
   *
   * @return {@code x,y} coordinate of top-left-most 1 bit, or null if it is all white
   */
  public getTopLeftOnBit(): Int32Array {
    const bits: Int32Array = this.bits;
    const rowSize: number = this.rowSize;

    let bitsOffset: number = 0;

    while (bitsOffset < bits.length && bits[bitsOffset] === 0) {
      bitsOffset++;
    }

    if (bitsOffset === bits.length) {
      return null;
    }

    const y: number = bitsOffset / rowSize;
    let x: number = (bitsOffset % rowSize) * 32;

    const theBits: number = bits[bitsOffset];
    let bit: number = 0;

    while (((theBits << (31 - bit)) & 0xffffffff) === 0) {
      bit++;
    }

    x += bit;

    return Int32Array.from([x, y]);
  }

  public getBottomRightOnBit(): Int32Array {
    const bits: Int32Array = this.bits;
    const rowSize: number = this.rowSize;

    let bitsOffset: number = bits.length - 1;

    while (bitsOffset >= 0 && bits[bitsOffset] === 0) {
      bitsOffset--;
    }

    if (bitsOffset < 0) {
      return null;
    }

    const y: number = Math.floor(bitsOffset / rowSize);
    let x: number = Math.floor(bitsOffset % rowSize) * 32;

    const theBits: number = bits[bitsOffset];
    let bit: number = 31;

    while (theBits >>> bit === 0) {
      bit--;
    }

    x += bit;

    return Int32Array.from([x, y]);
  }

  /**
   * @return The width of the matrix
   */
  public getWidth(): number {
    return this.width;
  }

  /**
   * @return The height of the matrix
   */
  public getHeight(): number {
    return this.height;
  }

  /**
   * @return The row size of the matrix
   */
  public getRowSize(): number {
    return this.rowSize;
  }

  /**
   * @override
   * @param o
   */
  public equals(o: BitMatrix): boolean {
    return this.width === o.width && this.height === o.height && this.rowSize === o.rowSize && Arrays.equals(this.bits, o.bits);
  }

  /**
   * @override
   */
  public hashCode(): number {
    let hash: number = this.width;

    hash = 31 * hash + this.width;
    hash = 31 * hash + this.height;
    hash = 31 * hash + this.rowSize;
    hash = 31 * hash + Arrays.hashCode(this.bits);

    return hash;
  }

  /**
   * @override
   * @param setString representation of a set bit
   * @param unsetString representation of an unset bit
   * @param lineSeparator newline character in string representation
   * @return string representation of entire matrix utilizing given strings and line separator
   */
  public toString(setString: string = 'X ', unsetString: string = '  ', lineSeparator: string = '\n') {
    const result: StringBuilder = new StringBuilder();

    result.append(lineSeparator);

    for (let y = 0, height = this.height; y < height; y++) {
      for (let x = 0, width = this.width; x < width; x++) {
        result.append(this.get(x, y) ? setString : unsetString);
      }

      result.append(lineSeparator);
    }

    return result.toString();
  }

  // @Override
  public clone(): BitMatrix {
    return new BitMatrix(this.width, this.height, this.rowSize, this.bits.slice());
  }
}
