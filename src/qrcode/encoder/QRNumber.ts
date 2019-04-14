/**
 * @module QRNumber
 * @author nuintun
 * @author Kazuhiko Arase
 */

import Mode from './Mode';
import QRData from './QRData';
import BitBuffer from './BitBuffer';

export default class QRNumber extends QRData {
  constructor(data: string) {
    super(Mode.Numeric, data);
  }

  public write(buffer: BitBuffer): void {
    let i: number = 0;
    const data: string = this.getData();
    const length: number = data.length;

    while (i + 2 < length) {
      buffer.put(QRNumber.strToNum(data.substring(i, i + 3)), 10);

      i += 3;
    }

    if (i < length) {
      if (length - i === 1) {
        buffer.put(QRNumber.strToNum(data.substring(i, i + 1)), 4);
      } else if (length - i === 2) {
        buffer.put(QRNumber.strToNum(data.substring(i, i + 2)), 7);
      }
    }
  }

  public getLength(): number {
    return this.getData().length;
  }

  private static strToNum(str: string): number {
    let num: number = 0;
    const length: number = str.length;

    for (let i: number = 0; i < length; i++) {
      num = num * 10 + QRNumber.charToNum(str.charAt(i));
    }

    return num;
  }

  private static charToNum(ch: string): number {
    if ('0' <= ch && ch <= '9') {
      return ch.charCodeAt(0) - 0x30;
    }

    throw `illegal char: ${ch}`;
  }
}
