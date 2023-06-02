/**
 * @module Numeric
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { Mode } from '../../common/Mode';
import { encode } from '../../encoding/UTF16';
import { Segment } from '../../encoder/Segment';
import { BitBuffer } from '../../encoder/BitBuffer';

function getByte(byte: number): number {
  // 0 - 9
  if (0x30 <= byte && byte <= 0x39) {
    return byte - 0x30;
  }

  throw new Error(`illegal char: ${String.fromCharCode(byte)}`);
}

function getBytes(bytes: number[]): number {
  let num = 0;

  for (const byte of bytes) {
    num = num * 10 + getByte(byte);
  }

  return num;
}

export class Numeric extends Segment {
  /**
   * @constructor
   * @param {string} text
   */
  constructor(text: string) {
    super(Mode.NUMERIC, encode(text));
  }

  /**
   * @public
   * @method writeTo
   * @param {BitBuffer} buffer
   */
  public writeTo(buffer: BitBuffer): void {
    let i = 0;

    const { bytes } = this;
    const { length } = bytes;

    while (i + 2 < length) {
      buffer.put(getBytes([bytes[i], bytes[i + 1], bytes[i + 2]]), 10);

      i += 3;
    }

    if (i < length) {
      if (length - i === 1) {
        buffer.put(getBytes([bytes[i]]), 4);
      } else if (length - i === 2) {
        buffer.put(getBytes([bytes[i], bytes[i + 1]]), 7);
      }
    }
  }
}
