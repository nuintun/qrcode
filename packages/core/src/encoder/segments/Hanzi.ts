/**
 * @module Hanzi
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { GB2312_MAPPING } from '/common/encoding/mapping';

function getHanziCode(character: string): number {
  const code = GB2312_MAPPING.get(character);

  return code != null ? code : NaN;
}

export class Hanzi {
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
    return Mode.HANZI;
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

    // GB/T 18284-2000.
    for (const character of content) {
      let code = getHanziCode(character);

      // For characters with GB2312 values from 0xa1a1 to 0xaafe.
      if (code >= 0xa1a1 && code <= 0xaafe) {
        // Subtract 0xa1a1 from GB2312 value.
        code -= 0xa1a1;
        // For characters with GB2312 values from 0xb0a1 to 0xfafe.
      } else if (code >= 0xb0a1 && code <= 0xfafe) {
        // Subtract 0xa6a1 from GB2312 value.
        code -= 0xa6a1;
      } else {
        throw new Error(`illegal hanzi character: ${character}`);
      }

      // Multiply most significant byte of result by 0x60 and add least significant byte to product.
      code = (code >> 8) * 0x60 + (code & 0xff);

      // Convert result to a 13-bit binary string.
      bits.append(code, 13);
    }

    return bits;
  }
}
