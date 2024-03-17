/**
 * @module Alphanumeric
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { ALPHANUMERIC_MAPPING } from '/common/encoding/mapping';

function getAlphanumericCode(character: string): number {
  const code = ALPHANUMERIC_MAPPING.get(character);

  if (code != null) {
    return code;
  }

  throw new Error(`illegal alphanumeric character: ${character}`);
}

export class Alphanumeric {
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
    return Mode.ALPHANUMERIC;
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
      const code1 = getAlphanumericCode(content[i]);

      if (i + 1 < length) {
        const code2 = getAlphanumericCode(content[i + 1]);

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
