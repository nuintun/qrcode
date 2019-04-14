/**
 * @module QRKanji
 * @author nuintun
 * @author Kazuhiko Arase
 * @description SJIS only
 */

import Mode from './Mode';
import QRData from './QRData';
import BitBuffer from './BitBuffer';
import stringToBytes from '../../encoding/SJIS';

function createCharError(index: number, data: number[]) {
  return `illegal char: ${String.fromCharCode(data[index])}`;
}

export default class QRKanji extends QRData {
  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string) {
    super(Mode.Kanji, data);
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    let index: number = 0;
    const data: number[] = stringToBytes(this.getData());
    const length: number = data.length;

    while (index + 1 < length) {
      let code: number = ((0xff & data[index]) << 8) | (0xff & data[index + 1]);

      if (0x8140 <= code && code <= 0x9ffc) {
        code -= 0x8140;
      } else if (0xe040 <= code && code <= 0xebbf) {
        code -= 0xc140;
      } else {
        throw createCharError(index, data);
      }

      code = ((code >>> 8) & 0xff) * 0xc0 + (code & 0xff);

      buffer.put(code, 13);

      index += 2;
    }

    if (index < data.length) {
      throw createCharError(index, data);
    }
  }

  /**
   * @public
   * @method getLength
   * @returns {number}
   */
  public getLength(): number {
    return stringToBytes(this.getData()).length / 2;
  }
}
