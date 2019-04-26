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

    this.bytes = stringToBytes(data);
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    const bytes: number[] = this.bytes;
    const length: number = bytes.length;

    for (let i: number = 0; i < length; i++) {
      buffer.put(bytes[i], 8);
    }
  }

  /**
   * @public
   * @method getLength
   * @returns {number}
   */
  public getLength(): number {
    return this.bytes.length;
  }
}
