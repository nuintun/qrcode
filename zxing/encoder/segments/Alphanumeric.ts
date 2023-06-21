/**
 * @module Alphanumeric
 */

import { Mode } from '/common/Mode';
import { BitArray } from '/common/BitArray';
import { assertContent } from '/encoder/utils/asserts';
import { ALPHANUMERIC_CHARACTERS, getCharactersMapping } from '/common/encoding';

const ALPHANUMERIC_MAPPING = getCharactersMapping(ALPHANUMERIC_CHARACTERS);

function getAlphanumericCode(character: string): number {
  const code = ALPHANUMERIC_MAPPING.get(character);

  if (code != null) {
    return code;
  }

  throw new Error(`illegal alphanumeric character: ${character}`);
}

export class Alphanumeric {
  #content: string;

  constructor(content: string) {
    assertContent(content);

    this.#content = content;
  }

  public get mode(): Mode {
    return Mode.ALPHANUMERIC;
  }

  public get content(): string {
    return this.#content;
  }

  public encode(): BitArray {
    const bits = new BitArray();
    const content = this.#content;
    const { length } = content;

    for (let i = 0; i < length; ) {
      const code1 = getAlphanumericCode(content.charAt(i));

      if (i + 1 < length) {
        const code2 = getAlphanumericCode(content.charAt(i + 1));

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
