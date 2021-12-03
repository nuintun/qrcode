/**
 * @module QR8BitByte
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { QRData } from './QRData';
import { Mode } from '../common/Mode';
import { BitBuffer } from './BitBuffer';
import { EncodingHint } from '../common/EncodingHint';
import { encode as encodeUTF8 } from '../../encoding/UTF8';

interface EncodeResult {
  bytes: number[];
  encoding: number;
}

type encode = (data: string) => EncodeResult;

export class QRByte extends QRData {
  public readonly encoding: number = -1;

  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string, encode?: encode) {
    super(Mode.Byte, data);

    if (typeof encode === 'function') {
      const { encoding, bytes } = encode(data);

      this.bytes = bytes;
      this.encoding = encoding;
    } else {
      this.bytes = encodeUTF8(data);
      this.encoding = EncodingHint.UTF8;
    }
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
