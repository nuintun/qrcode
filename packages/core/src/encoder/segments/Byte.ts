/**
 * @module Byte
 */

import { Mode } from '/common/Mode';
import { Charset } from '/common/Charset';
import { BitArray } from '/common/BitArray';
import { TextEncode } from '/common/encoding';
import { assertCharset, assertContent } from '/encoder/utils/asserts';

export class Byte {
  #content: string;
  #charset: Charset;

  /**
   * @constructor
   * @param content The content to encode.
   * @param charset The charset of the content.
   */
  constructor(content: string, charset: Charset = Charset.ISO_8859_1) {
    assertContent(content);
    assertCharset(charset);

    this.#content = content;
    this.#charset = charset;
  }

  /**
   * @property mode
   * @description The mode of the segment.
   */
  public get mode(): Mode {
    return Mode.BYTE;
  }

  /**
   * @property content
   * @description The content of the segment.
   */
  public get content(): string {
    return this.#content;
  }

  /**
   * @property charset
   * @description The charset of the content.
   */
  public get charset(): Charset {
    return this.#charset;
  }

  /**
   * @method encode
   * @description Encode the segment.
   * @param encode The text encode function.
   */
  public encode(encode: TextEncode): BitArray {
    const bits = new BitArray();
    const bytes = encode(this.#content, this.#charset);

    for (const byte of bytes) {
      bits.append(byte, 8);
    }

    return bits;
  }
}
