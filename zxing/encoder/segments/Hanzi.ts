/**
 * @module Hanzi
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { getEncodingMapping, getSerialRanges } from '/common/encoding';

const GB2312_MAPPING = getEncodingMapping(
  'gb2312',
  [0xa1a1, 0xa1fe],
  [0xa2b1, 0xa2e2],
  [0xa2e5, 0xa2ee],
  [0xa2f1, 0xa2fc],
  [0xa3a1, 0xa3fe],
  [0xa4a1, 0xa4f3],
  [0xa5a1, 0xa5f6],
  [0xa6a1, 0xa6b8],
  [0xa6c1, 0xa6d8],
  [0xa7a1, 0xa7c1],
  [0xa7d1, 0xa7f1],
  [0xa8a1, 0xa8ba],
  [0xa8c5, 0xa8e9],
  [0xa9a4, 0xa9ef],
  ...getSerialRanges(0xb0a1, 0xd6fe, [0, 93]),
  [0xd7a1, 0xd7f9],
  ...getSerialRanges(0xd8a1, 0xf7fe, [0, 93])
);

function getHanziCode(character: string): number {
  const code = GB2312_MAPPING.get(character);

  return code != null ? code : -1;
}

export class Hanzi {
  #content: string;

  constructor(content: string) {
    assertContent(content);

    this.#content = content;
  }

  public get mode(): Mode {
    return Mode.HANZI;
  }

  public get content(): string {
    return this.#content;
  }

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
