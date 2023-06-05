/**
 * @module Byte
 */

import { BitArray } from '/common/BitArray';
import { Charset } from '/common/Charset';

interface EncodeResult {
  readonly charset: Charset;
  readonly bytes: ArrayLike<number>;
}

interface TextEncode {
  (content: string): EncodeResult;
}

const encoder = new TextEncoder();

export class Byte {
  #bits: BitArray;
  #charset: Charset;

  constructor(
    content: string,
    encode: TextEncode = content => {
      return {
        charset: Charset.UTF_8,
        bytes: encoder.encode(content)
      };
    }
  ) {
    let i = 0;

    const { bytes, charset } = encode(content);
    const bits = new BitArray();
    const { length } = bytes;

    while (i < length) {
      bits.append(bytes[i++], 8);
    }

    this.#bits = bits;
    this.#charset = charset;
  }

  public get bits(): BitArray {
    return this.#bits;
  }

  public get charset(): Charset {
    return this.#charset;
  }
}
