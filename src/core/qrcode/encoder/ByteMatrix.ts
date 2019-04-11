/*
 * Copyright 2008 ZXing authors
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

import Arrays from '../../util/Arrays';
import StringBuilder from '../../util/StringBuilder';

/**
 * JAVAPORT: The original code was a 2D array of ints, but since it only ever gets assigned
 * -1, 0, and 1, I'm going to use less memory and go with bytes.
 *
 * @author dswitkin@google.com (Daniel Switkin)
 */
export default class ByteMatrix {
  private bytes: Uint8Array[];
  private width: number;
  private height: number;

  public constructor(width: number, height: number) {
    // [height][width]
    const bytes: Uint8Array[] = new Array<Uint8Array>(height);

    for (let i: number = 0; i !== height; i++) {
      bytes[i] = new Uint8Array(width);
    }

    this.bytes = bytes;
    this.width = width;
    this.height = height;
  }

  public getHeight(): number {
    return this.height;
  }

  public getWidth(): number {
    return this.width;
  }

  public get(x: number, y: number): number {
    return this.bytes[y][x];
  }

  /**
   * @return an internal representation as bytes, in row-major order. array[y][x] represents point (x,y)
   */
  public getArray(): Uint8Array[] {
    return this.bytes;
  }

  // TYPESCRIPTPORT: preffer to let two methods instead of override to avoid type comparison inside
  public setNumber(x: number, y: number, value: number): void {
    this.bytes[y][x] = value;
  }

  public setBoolean(x: number, y: number, value: boolean): void {
    this.bytes[y][x] = value ? 1 : 0;
  }

  public clear(value: number): void {
    for (const aByte of this.bytes) {
      Arrays.fillUint8Array(aByte, value);
    }
  }

  public equals(o: ByteMatrix) {
    if (this.width !== o.width) {
      return false;
    }

    if (this.height !== o.height) {
      return false;
    }

    for (let y: number = 0, height: number = this.height; y < height; ++y) {
      const bytesY = this.bytes[y];
      const otherBytesY = o.bytes[y];

      for (let x: number = 0, width: number = this.width; x < width; ++x) {
        if (bytesY[x] !== otherBytesY[x]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * @override
   */
  public toString(): string {
    const result = new StringBuilder(); // (2 * width * height + 2)

    for (let y = 0, height = this.height; y < height; ++y) {
      const bytesY = this.bytes[y];

      for (let x = 0, width = this.width; x < width; ++x) {
        switch (bytesY[x]) {
          case 0:
            result.append(' 0');
            break;
          case 1:
            result.append(' 1');
            break;
          default:
            result.append('  ');
            break;
        }
      }
      result.append('\n');
    }

    return result.toString();
  }
}
