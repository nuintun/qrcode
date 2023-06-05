/**
 * @module Numeric
 */

import { BitArray } from '/common/BitArray';

function getDigit(character: string): number {
  return character.charCodeAt(0) - 48;
}

export class Numeric {
  #bits: BitArray;

  constructor(content: string) {
    let i = 0;

    const { length } = content;
    const bits = new BitArray();

    while (i < length) {
      const num1 = getDigit(content.charAt(i));

      if (i + 2 < length) {
        // Encode three numeric letters in ten bits.
        const num2 = getDigit(content.charAt(i + 1));
        const num3 = getDigit(content.charAt(i + 2));

        bits.append(num1 * 100 + num2 * 10 + num3, 10);

        i += 3;
      } else if (i + 1 < length) {
        // Encode two numeric letters in seven bits.
        const num2 = getDigit(content.charAt(i + 1));

        bits.append(num1 * 10 + num2, 7);

        i += 2;
      } else {
        // Encode one numeric letter in four bits.
        bits.append(num1, 4);

        i++;
      }
    }

    this.#bits = bits;
  }

  public get bits(): BitArray {
    return this.#bits;
  }
}
