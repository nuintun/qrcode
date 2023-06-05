/**
 * @module Alphanumeric
 */

import { BitArray } from '/common/BitArray';

const ALPHANUMERIC_TABLE = [
  // 0x00-0x0f
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // 0x10-0x1f
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  // 0x20-0x2f
  36, -1, -1, -1, 37, 38, -1, -1, -1, -1, 39, 40, -1, 41, 42, 43,
  // 0x30-0x3f
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, -1, -1, -1, -1, -1,
  // 0x40-0x4f
  -1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  // 0x50-0x5f
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, -1, -1, -1, -1, -1
];

function getAlphanumericCode(code: number): number {
  if (code < ALPHANUMERIC_TABLE.length) {
    return ALPHANUMERIC_TABLE[code];
  }

  return -1;
}

export class Alphanumeric {
  #bits: BitArray;

  constructor(content: string) {
    let i = 0;

    const { length } = content;
    const bits = new BitArray();

    while (i < length) {
      const code1 = getAlphanumericCode(content.charCodeAt(i));

      if (code1 === -1) {
        throw new Error();
      }

      if (i + 1 < length) {
        const code2 = getAlphanumericCode(content.charCodeAt(i + 1));

        if (code2 === -1) {
          throw new Error('');
        }

        // Encode two alphanumeric letters in 11 bits.
        bits.append(code1 * 45 + code2, 11);

        i += 2;
      } else {
        // Encode one alphanumeric letter in six bits.
        bits.append(code1, 6);

        i++;
      }
    }

    this.#bits = bits;
  }

  public get bits(): BitArray {
    return this.#bits;
  }
}
