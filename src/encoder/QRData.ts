/**
 * @module QRData
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { Mode } from '/common/Mode';
import { BitBuffer } from './BitBuffer';

export abstract class QRData {
  public readonly mode: Mode;
  protected bytes: number[] = [];
  protected readonly data: string;

  constructor(mode: Mode, data: string) {
    this.mode = mode;
    this.data = data;
  }

  public getLength(): number {
    return this.bytes.length;
  }

  public abstract writeTo(buffer: BitBuffer): void;

  public getLengthInBits(version: number): number {
    const mode = this.mode;
    const error = new Error(`illegal mode: ${mode}`);

    if (1 <= version && version < 10) {
      // 1 - 9
      switch (mode) {
        case Mode.NUMERIC:
          return 10;
        case Mode.ALPHANUMERIC:
          return 9;
        case Mode.BYTE:
          return 8;
        case Mode.KANJI:
          return 8;
        default:
          throw error;
      }
    } else if (version < 27) {
      // 10 - 26
      switch (mode) {
        case Mode.NUMERIC:
          return 12;
        case Mode.ALPHANUMERIC:
          return 11;
        case Mode.BYTE:
          return 16;
        case Mode.KANJI:
          return 10;
        default:
          throw error;
      }
    } else if (version < 41) {
      // 27 - 40
      switch (mode) {
        case Mode.NUMERIC:
          return 14;
        case Mode.ALPHANUMERIC:
          return 13;
        case Mode.BYTE:
          return 16;
        case Mode.KANJI:
          return 12;
        default:
          throw error;
      }
    } else {
      throw new Error(`illegal version: ${version}`);
    }
  }
}
