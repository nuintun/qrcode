/**
 * @module QRNumeric
 * @author nuintun
 * @author Kazuhiko Arase
 */

import QRData from './QRData';
import Mode from '../common/Mode';
import BitBuffer from './BitBuffer';
import { default as stringToBytes } from '../../encoding/UTF16';

function getCode(byte: number): number {
  // 0 - 9
  if (0x30 <= byte && byte <= 0x39) {
    return byte - 0x30;
  }

  throw `illegal char: ${String.fromCharCode(byte)}`;
}

function getBatchCode(bytes: number[]): number {
  let num: number = 0;
  const length: number = bytes.length;

  for (let i: number = 0; i < length; i++) {
    num = num * 10 + getCode(bytes[i]);
  }

  return num;
}

export default class QRNumeric extends QRData {
  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string) {
    super(Mode.Numeric, data);

    this.bytes = stringToBytes(data);
  }

  /**
   * @public
   * @method write
   * @param {BitBuffer} buffer
   */
  public write(buffer: BitBuffer): void {
    let i: number = 0;
    const bytes: number[] = this.bytes;
    const length: number = bytes.length;

    while (i + 2 < length) {
      buffer.put(getBatchCode([bytes[i], bytes[i + 1], bytes[i + 2]]), 10);

      i += 3;
    }

    if (i < length) {
      if (length - i === 1) {
        buffer.put(getBatchCode([bytes[i]]), 4);
      } else if (length - i === 2) {
        buffer.put(getBatchCode([bytes[i], bytes[i + 1]]), 7);
      }
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
