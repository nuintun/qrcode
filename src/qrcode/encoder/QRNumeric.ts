/**
 * @module QRNumeric
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { QRData } from './QRData';
import { Mode } from '../common/Mode';
import { BitBuffer } from './BitBuffer';
import { UTF16 as stringToBytes } from '../../encoding/UTF16';

function getByte(byte: number): number {
  // 0 - 9
  if (0x30 <= byte && byte <= 0x39) {
    return byte - 0x30;
  }

  throw new Error(`illegal char: ${String.fromCharCode(byte)}`);
}

function getBytes(bytes: number[]): number {
  let num: number = 0;
  const length: number = bytes.length;

  for (let i: number = 0; i < length; i++) {
    num = num * 10 + getByte(bytes[i]);
  }

  return num;
}

export class QRNumeric extends QRData {
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
      buffer.put(getBytes([bytes[i], bytes[i + 1], bytes[i + 2]]), 10);

      i += 3;
    }

    if (i < length) {
      if (length - i === 1) {
        buffer.put(getBytes([bytes[i]]), 4);
      } else if (length - i === 2) {
        buffer.put(getBytes([bytes[i], bytes[i + 1]]), 7);
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
