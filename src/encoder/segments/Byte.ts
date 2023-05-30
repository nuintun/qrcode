/**
 * @module Byte
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { ECI } from '/common/ECI';
import { Mode } from '/common/Mode';
import { Segment } from '/encoder/Segment';
import { BitBuffer } from '/encoder/BitBuffer';
import { encode as encodeUTF8 } from '/encoding/UTF8';

interface EncodeResult {
  readonly bytes: number[];
  readonly encoding: number;
}

type TextEncode = (data: string) => EncodeResult;

export class Byte extends Segment {
  #encoding: number = -1;

  /**
   * @constructor
   * @param {string} text
   * @param {TextEncode} [encode]
   */
  constructor(text: string, encode?: TextEncode) {
    let bytes: number[];
    let encoding: number;

    if (typeof encode === 'function') {
      ({ bytes, encoding } = encode(text));
    } else {
      bytes = encodeUTF8(text);

      encoding = ECI.UTF8;
    }

    super(Mode.BYTE, bytes);

    this.#encoding = encoding;
  }

  public get encoding(): number {
    return this.#encoding;
  }

  /**
   * @public
   * @method writeTo
   * @param {BitBuffer} buffer
   */
  public writeTo(buffer: BitBuffer): void {
    const { bytes } = this;

    for (const byte of bytes) {
      buffer.put(byte, 8);
    }
  }
}
