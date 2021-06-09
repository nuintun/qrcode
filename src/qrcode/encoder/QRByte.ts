/**
 * @module QR8BitByte
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { QRData } from './QRData';
import { Mode } from '../common/Mode';
import { BitBuffer } from './BitBuffer';
import { EncodingHint } from '../common/EncodingHint';
import { encode as stringToBytes } from '../../encoding/UTF8';

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
      const { encoding, bytes }: EncodeResult = encode(data);

      this.bytes = bytes;
      this.encoding = encoding;
    } else {
      this.bytes = stringToBytes(data);
      this.encoding = EncodingHint.UTF8;
    }
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    const bytes: number[] = this.bytes;

    for (const byte of bytes) {
      buffer.put(byte, 8);
    }
  }
}
