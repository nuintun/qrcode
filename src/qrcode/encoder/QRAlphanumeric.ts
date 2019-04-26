/**
 * @module QRAlphanumeric
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRData from './QRData';
import Mode from '../common/Mode';
import BitBuffer from './BitBuffer';

export default class QRAlphanumeric extends QRData {
  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string) {
    super(Mode.Alphanumeric, data);
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    let i: number = 0;
    const data: string = this.getData();
    const length: number = data.length;

    while (i + 1 < length) {
      buffer.put(QRAlphanumeric.getCode(data.charAt(i)) * 45 + QRAlphanumeric.getCode(data.charAt(i + 1)), 11);

      i += 2;
    }

    if (i < data.length) {
      buffer.put(QRAlphanumeric.getCode(data.charAt(i)), 6);
    }
  }

  /**
   * @public
   * @method getLength
   * @returns {number}
   */
  public getLength(): number {
    return this.getData().length;
  }

  private static getCode(ch: string): number {
    if ('0' <= ch && ch <= '9') {
      // 0
      return ch.charCodeAt(0) - 0x30;
    } else if ('A' <= ch && ch <= 'Z') {
      // A
      return ch.charCodeAt(0) - 0x41 + 10;
    } else {
      switch (ch) {
        case ' ':
          return 36;
        case '$':
          return 37;
        case '%':
          return 38;
        case '*':
          return 39;
        case '+':
          return 40;
        case '-':
          return 41;
        case '.':
          return 42;
        case '/':
          return 43;
        case ':':
          return 44;
        default:
          throw `illegal char: ${ch}`;
      }
    }
  }
}
