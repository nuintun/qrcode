/**
 * @module Kanji
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { SHIFT_JIS_MAPPING } from '/common/encoding';
import { assertContent } from '/encoder/utils/asserts';

function getKanjiCode(character: string): number {
  const code = SHIFT_JIS_MAPPING.get(character);

  return code != null ? code : NaN;
}

export class Kanji {
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
    return Mode.KANJI;
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
    const content = this.#content;

    for (const character of content) {
      let code = getKanjiCode(character);

      // For characters with Shift JIS values from 0x8140 to 0x9ffc.
      if (code >= 0x8140 && code <= 0x9ffc) {
        // Subtract 0x8140 from Shift JIS value.
        code -= 0x8140;
        // For characters with Shift JIS values from 0xe040 to 0xebbf.
      } else if (code >= 0xe040 && code <= 0xebbf) {
        // Subtract 0xc140 from Shift JIS value.
        code -= 0xc140;
      } else {
        throw new Error(`illegal kanji character: ${character}`);
      }

      // Multiply most significant byte of result by 0xc0 and add least significant byte to product.
      code = (code >> 8) * 0xc0 + (code & 0xff);

      // Convert result to a 13-bit binary string.
      bits.append(code, 13);
    }

    return bits;
  }
}
