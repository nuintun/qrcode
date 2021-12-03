/**
 * @module QRAlphanumeric
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { QRData } from './QRData';
import { Mode } from '../common/Mode';
import { BitBuffer } from './BitBuffer';
import { encode } from '../../encoding/UTF16';

function getByte(byte: number): number {
  if (0x30 <= byte && byte <= 0x39) {
    // 0 - 9
    return byte - 0x30;
  } else if (0x41 <= byte && byte <= 0x5a) {
    // A - Z
    return byte - 0x41 + 10;
  } else {
    switch (byte) {
      // space
      case 0x20:
        return 36;
      // $
      case 0x24:
        return 37;
      // %
      case 0x25:
        return 38;
      // *
      case 0x2a:
        return 39;
      // +
      case 0x2b:
        return 40;
      // -
      case 0x2d:
        return 41;
      // .
      case 0x2e:
        return 42;
      // /
      case 0x2f:
        return 43;
      // :
      case 0x3a:
        return 44;
      default:
        throw new Error(`illegal char: ${String.fromCharCode(byte)}`);
    }
  }
}

export class QRAlphanumeric extends QRData {
  /**
   * @constructor
   * @param {string} data
   */
  constructor(data: string) {
    super(Mode.Alphanumeric, data);

    this.bytes = encode(data);
  }

  /**
   * @public
   * @method writeTo
   * @param {BitBuffer} buffer
   */
  public writeTo(buffer: BitBuffer): void {
    let i = 0;

    const { bytes } = this;
    const { length } = bytes;

    while (i + 1 < length) {
      buffer.put(getByte(bytes[i]) * 45 + getByte(bytes[i + 1]), 11);

      i += 2;
    }

    if (i < length) {
      buffer.put(getByte(bytes[i]), 6);
    }
  }
}
