/**
 * @module Numeric
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';

function getNumericCode(code: number): number {
  // 0 - 9
  if (48 <= code && code <= 57) {
    return code - 48;
  }

  throw new Error(`illegal numeric character: ${String.fromCharCode(code)}`);
}

export class Numeric {
  #content: string;

  constructor(content: string) {
    assertContent(content);

    this.#content = content;
  }

  public get mode(): Mode {
    return Mode.NUMERIC;
  }

  public get content(): string {
    return this.#content;
  }

  public encode(): BitArray {
    const bits = new BitArray();
    const content = this.#content;
    const { length } = content;

    for (let i = 0; i < length; ) {
      const code1 = getNumericCode(content.charCodeAt(i));

      if (i + 2 < length) {
        // Encode three numeric letters in ten bits.
        const code2 = getNumericCode(content.charCodeAt(i + 1));
        const code3 = getNumericCode(content.charCodeAt(i + 2));

        bits.append(code1 * 100 + code2 * 10 + code3, 10);

        i += 3;
      } else if (i + 1 < length) {
        // Encode two numeric letters in seven bits.
        const code2 = getNumericCode(content.charCodeAt(i + 1));

        bits.append(code1 * 10 + code2, 7);

        i += 2;
      } else {
        // Encode one numeric letter in four bits.
        bits.append(code1, 4);

        i++;
      }
    }

    return bits;
  }
}
