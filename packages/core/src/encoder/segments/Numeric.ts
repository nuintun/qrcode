/**
 * @module Numeric
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { NUMERIC_MAPPING } from '/common/encoding/mapping';

function getNumericCode(character: string): number {
  const code = NUMERIC_MAPPING.get(character);

  if (code != null) {
    return code;
  }

  throw new Error(`illegal numeric character: ${character}`);
}

export class Numeric {
  #content: string;

  /**
   * @constructor
   * @param content The content to encode.
   */
  constructor(content: string) {
    assertContent(content);

    this.#content = content;
  }

  /**
   * @property mode
   * @description The mode of the segment.
   */
  public get mode(): Mode {
    return Mode.NUMERIC;
  }

  /**
   * @property content
   * @description The content of the segment.
   */
  public get content(): string {
    return this.#content;
  }

  /**
   * @method encode
   * @description Encode the segment.
   */
  public encode(): BitArray {
    const bits = new BitArray();
    const content = Array.from(this.#content);
    const { length } = content;

    for (let i = 0; i < length; ) {
      const code1 = getNumericCode(content[i]);

      if (i + 2 < length) {
        // Encode three numeric letters in ten bits.
        const code2 = getNumericCode(content[i + 1]);
        const code3 = getNumericCode(content[i + 2]);

        bits.append(code1 * 100 + code2 * 10 + code3, 10);

        i += 3;
      } else if (i + 1 < length) {
        // Encode two numeric letters in seven bits.
        const code2 = getNumericCode(content[i + 1]);

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
