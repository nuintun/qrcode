/**
 * @module Kanji
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { getEncodingMapping, getSerialRanges } from '/common/encoding';

const SHIFT_JIS = getEncodingMapping(
  'shift-jis',
  [0x8140, 0x817e],
  [0x8180, 0x81ac],
  [0x81b8, 0x81bf],
  [0x81c8, 0x81ce],
  [0x81da, 0x81e8],
  [0x81f0, 0x81f7],
  [0x81fc, 0x81fc],
  [0x824f, 0x8258],
  [0x8260, 0x8279],
  [0x8281, 0x829a],
  [0x829f, 0x82f1],
  [0x8340, 0x837e],
  [0x8380, 0x8396],
  [0x839f, 0x83b6],
  [0x83bf, 0x83d6],
  [0x8440, 0x8460],
  [0x8470, 0x847e],
  [0x8480, 0x8491],
  [0x849f, 0x84be],
  [0x8740, 0x875d],
  [0x875f, 0x8775],
  [0x877e, 0x877e],
  [0x8780, 0x878f],
  [0x8793, 0x8794],
  [0x8798, 0x8799],
  [0x889f, 0x88fc],
  ...getSerialRanges(0x8940, 0x97fc, [0, 62, 64, 188]),
  [0x9840, 0x9872],
  [0x989f, 0x98fc],
  ...getSerialRanges(0x9940, 0x9ffc, [0, 62, 64, 188]),
  ...getSerialRanges(0xe040, 0xe9fc, [0, 62, 64, 188]),
  [0xea40, 0xea7e],
  [0xea80, 0xeaa4]
);

function getKanjiCode(character: string): number {
  const code = SHIFT_JIS.get(character);

  return code != null ? code : -1;
}

export class Kanji {
  #content: string;

  constructor(content: string) {
    assertContent(content);

    this.#content = content;
  }

  public get mode(): Mode {
    return Mode.KANJI;
  }

  public get content(): string {
    return this.#content;
  }

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
