/**
 * @module Hanzi
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { getEncodingMapping, getSerialRanges } from '/common/encoding';

const GB2312 = getEncodingMapping(
  'gb2312',
  [0xa1a1, 0xa1fe],
  ...getSerialRanges(0xa240, 0xaafe, [0, 62, 64, 190]),
  [0xb0a1, 0xb0fe],
  ...getSerialRanges(0xb140, 0xfafe, [0, 62, 64, 190])
);

function getHanziCode(character: string): number {
  const code = GB2312.get(character);

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
      let value = getHanziCode(character);

      // For characters with GB2312 values from 0xa1a1 to 0xaafe.
      if (value >= 0xa1a1 && value <= 0xaafe) {
        // Subtract 0xa1a1 from GB2312 value.
        value -= 0xa1a1;
        // For characters with GB2312 values from 0xb0a1 to 0xfafe.
      } else if (value >= 0xb0a1 && value <= 0xfafe) {
        // Subtract 0xa6a1 from GB2312 value.
        value -= 0xa6a1;
      } else {
        throw new Error(`illegal hanzi character: ${character}`);
      }

      // Multiply most significant byte of result by 0x60 and add least significant byte to product.
      value = (value >> 8) * 0x60 + (value & 0xff);

      // Convert result to a 13-bit binary string.
      bits.append(value, 13);
    }

    return bits;
  }
}
