/**
 * @module QRAlphaNum
 * @author nuintun
 * @author Kazuhiko Arase
 */

import Mode from './Mode';
import QRData from './QRData';
import BitBuffer from './BitBuffer';

export default class QRAlphaNum extends QRData {
  constructor(data: string) {
    super(Mode.Alphanumeric, data);
  }

  public write(buffer: BitBuffer): void {
    let i: number = 0;
    const data: string = this.getData();
    const length: number = data.length;

    while (i + 1 < length) {
      buffer.put(QRAlphaNum.getCode(data.charAt(i)) * 45 + QRAlphaNum.getCode(data.charAt(i + 1)), 11);

      i += 2;
    }

    if (i < data.length) {
      buffer.put(QRAlphaNum.getCode(data.charAt(i)), 6);
    }
  }

  public getLength(): number {
    return this.getData().length;
  }

  private static getCode(ch: string): number {
    if ('0' <= ch && ch <= '9') {
      return ch.charCodeAt(0) - '0'.charCodeAt(0);
    } else if ('A' <= ch && ch <= 'Z') {
      return ch.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
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
