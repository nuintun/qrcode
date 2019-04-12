/**
 * @class QRKanji(SJIS only)
 * @author nuintun
 * @author Kazuhiko Arase
 */

import Mode from './Mode';
import QRCode from './QRCode';
import QRData from './QRData';
import BitBuffer from './BitBuffer';

function createCharError(index: number) {
  return `illegal char at ${index + 1}`;
}

export class QRKanji extends QRData {
  constructor(data: string) {
    super(Mode.Kanji, data);
  }

  public write(buffer: BitBuffer): void {
    let i: number = 0;
    const data: number[] = QRCode.stringToBytes(this.getData());
    const length: number = data.length;

    while (i + 1 < length) {
      let c: number = ((0xff & data[i]) << 8) | (0xff & data[i + 1]);

      if (0x8140 <= c && c <= 0x9ffc) {
        c -= 0x8140;
      } else if (0xe040 <= c && c <= 0xebbf) {
        c -= 0xc140;
      } else {
        throw `${createCharError(i)} / ${c}`;
      }

      c = ((c >>> 8) & 0xff) * 0xc0 + (c & 0xff);

      buffer.put(c, 13);

      i += 2;
    }

    if (i < data.length) {
      throw createCharError(i);
    }
  }

  public getLength(): number {
    return QRCode.stringToBytes(this.getData()).length / 2;
  }
}
