/**
 * @module Kanji
 * @author nuintun
 * @author Kazuhiko Arase
 * @description SJIS only
 */

import { Mode } from '../../common/Mode';
import { encode } from '../../encoding/SJIS';
import { Segment } from '../../encoder/Segment';
import { BitBuffer } from '../../encoder/BitBuffer';

export class Kanji extends Segment {
  /**
   * @constructor
   * @param {string} text
   */
  constructor(text: string) {
    super(Mode.KANJI, encode(text));
  }

  /**
   * @public
   * @method getLength
   * @returns {number}
   */
  public override get length(): number {
    return Math.floor(this.bytes.length / 2);
  }

  /**
   * @public
   * @method writeTo
   * @param {BitBuffer} buffer
   */
  public writeTo(buffer: BitBuffer): void {
    let index = 0;

    const { bytes } = this;
    const { length } = bytes;

    while (index + 1 < length) {
      let code = ((0xff & bytes[index]) << 8) | (0xff & bytes[index + 1]);

      if (0x8140 <= code && code <= 0x9ffc) {
        code -= 0x8140;
      } else if (0xe040 <= code && code <= 0xebbf) {
        code -= 0xc140;
      }

      code = ((code >> 8) & 0xff) * 0xc0 + (code & 0xff);

      buffer.put(code, 13);

      index += 2;
    }
  }
}
