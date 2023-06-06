/**
 * @module Numeric
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';

function getDigit(code: number): number {
  // 0 - 9
  if (48 <= code && code <= 57) {
    return code - 48;
  }

  throw new Error(`illegal character: ${String.fromCharCode(code)}`);
}

export class Numeric {
  #content: string;

  constructor(content: string) {
    this.#content = content;
  }

  public get mode(): Mode {
    return Mode.NUMERIC;
  }

  public get content(): string {
    return this.#content;
  }

  public encode(): BitArray {
    const content = this.#content;
    const bits = new BitArray();
    const { length } = content;

    let i = 0;

    while (i < length) {
      const num1 = getDigit(content.charCodeAt(i));

      if (i + 2 < length) {
        // Encode three numeric letters in ten bits.
        const num2 = getDigit(content.charCodeAt(i + 1));
        const num3 = getDigit(content.charCodeAt(i + 2));

        bits.append(num1 * 100 + num2 * 10 + num3, 10);

        i += 3;
      } else if (i + 1 < length) {
        // Encode two numeric letters in seven bits.
        const num2 = getDigit(content.charCodeAt(i + 1));

        bits.append(num1 * 10 + num2, 7);

        i += 2;
      } else {
        // Encode one numeric letter in four bits.
        bits.append(num1, 4);

        i++;
      }
    }

    return bits;
  }
}
