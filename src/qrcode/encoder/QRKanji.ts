/**
 * @module QRKanji
 * @author nuintun
 * @author Kazuhiko Arase
 * @description SJIS only
 */

import { QRData } from './QRData';
import { Mode } from '../common/Mode';
import { BitBuffer } from './BitBuffer';
import { SJIS as stringToBytes } from '../../encoding/SJIS';

export class QRKanji extends QRData {
  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string) {
    super(Mode.Kanji, data);

    this.bytes = stringToBytes(data);
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    let index: number = 0;
    const bytes: number[] = this.bytes;
    const length: number = bytes.length;

    while (index + 1 < length) {
      let code: number = ((0xff & bytes[index]) << 8) | (0xff & bytes[index + 1]);

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

  /**
   * @public
   * @method getLength
   * @returns {number}
   */
  public getLength(): number {
    return Math.floor(this.bytes.length / 2);
  }
}
