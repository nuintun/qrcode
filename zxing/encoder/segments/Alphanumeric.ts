/**
 * @module Alphanumeric
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';

const ALPHANUMERIC_TABLE = [
  // 0x20-0x2f
  36, -1, -1, -1, 37, 38, -1, -1, -1, -1, 39, 40, -1, 41, 42, 43,
  // 0x30-0x3f
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 44, -1, -1, -1, -1, -1,
  // 0x40-0x4f
  -1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
  // 0x50-0x5a
  25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35
];

function getAlphanumericCode(code: number): number {
  const index = code - 32;

  if (index < ALPHANUMERIC_TABLE.length) {
    return ALPHANUMERIC_TABLE[index];
  }

  throw new Error(`illegal character: ${String.fromCharCode(code)}`);
}

export class Alphanumeric {
  #content: string;

  constructor(content: string) {
    this.#content = content;
  }

  public get mode(): Mode {
    return Mode.ALPHANUMERIC;
  }

  public get content(): string {
    return this.#content;
  }

  public encode(): BitArray {
    const bits = new BitArray();
    const content = this.#content;
    const { length } = content;

    for (let i = 0; i < length; ) {
      const code1 = getAlphanumericCode(content.charCodeAt(i));

      if (i + 1 < length) {
        const code2 = getAlphanumericCode(content.charCodeAt(i + 1));

        // Encode two alphanumeric letters in 11 bits.
        bits.append(code1 * 45 + code2, 11);

        i += 2;
      } else {
        // Encode one alphanumeric letter in six bits.
        bits.append(code1, 6);

        i++;
      }
    }

    return bits;
  }
}
