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

export default class Integer {
  public static MIN_VALUE_32_BITS: number = -2147483648;

  public static numberOfTrailingZeros(i: number): number {
    let y: number;

    if (i === 0) return 32;

    let n = 31;

    y = i << 16;

    if (y !== 0) {
      n -= 16;
      i = y;
    }

    y = i << 8;

    if (y !== 0) {
      n -= 8;
      i = y;
    }

    y = i << 4;

    if (y !== 0) {
      n -= 4;
      i = y;
    }

    y = i << 2;

    if (y !== 0) {
      n -= 2;
      i = y;
    }

    return n - ((i << 1) >>> 31);
  }

  public static numberOfLeadingZeros(i: number): number {
    // HD, Figure 5-6
    if (i === 0) {
      return 32;
    }

    let n: number = 1;

    if (i >>> 16 === 0) {
      n += 16;
      i <<= 16;
    }

    if (i >>> 24 === 0) {
      n += 8;
      i <<= 8;
    }

    if (i >>> 28 === 0) {
      n += 4;
      i <<= 4;
    }

    if (i >>> 30 === 0) {
      n += 2;
      i <<= 2;
    }

    n -= i >>> 31;

    return n;
  }

  public static toHexString(i: number) {
    return i.toString(16);
  }

  // Returns the number of one-bits in the two's complement binary representation of the specified int value. This function is sometimes referred to as the population count.
  // Returns:
  // the number of one-bits in the two's complement binary representation of the specified int value.
  public static bitCount(i: number): number {
    // HD, Figure 5-2
    i = i - ((i >>> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
    i = (i + (i >>> 4)) & 0x0f0f0f0f;
    i = i + (i >>> 8);
    i = i + (i >>> 16);

    return i & 0x3f;
  }
}
