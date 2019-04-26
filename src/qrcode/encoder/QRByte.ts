/**
 * @module QR8BitByte
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRData from './QRData';
import Mode from '../common/Mode';
import BitBuffer from './BitBuffer';
import stringToBytes from '../../encoding/UTF8';

export default class QRByte extends QRData {
  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string) {
    super(Mode.Byte, data);
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    const data: number[] = stringToBytes(this.getData());
    const length: number = data.length;

    for (let i: number = 0; i < length; i++) {
      buffer.put(data[i], 8);
    }
  }

  /**
   * @public
   * @method getLength
   * @returns {number}
   */
  public getLength(): number {
    return stringToBytes(this.getData()).length;
  }
}
