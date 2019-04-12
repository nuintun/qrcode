/**
 * @class QR8BitByte
 * @author nuintun
 * @author Kazuhiko Arase
 */

import Mode from './Mode';
import QRCode from './QRCode';
import QRData from './QRData';
import BitBuffer from './BitBuffer';

export default class QR8BitByte extends QRData {
  constructor(data: string) {
    super(Mode.Byte, data);
  }

  public write(buffer: BitBuffer): void {
    const data: number[] = QRCode.stringToBytes(this.getData());
    const length: number = data.length;

    for (let i: number = 0; i < length; i++) {
      buffer.put(data[i], 8);
    }
  }

  public getLength(): number {
    return QRCode.stringToBytes(this.getData()).length;
  }
}
