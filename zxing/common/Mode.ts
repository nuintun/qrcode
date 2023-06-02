/**
 * @module Mode
 */

import { Version } from './Version';

export class Mode {
  #bits: number;
  #characterCountBitsSet: Int32Array;

  public static readonly TERMINATOR = new Mode([0, 0, 0], 0x00);
  public static readonly NUMERIC = new Mode([10, 12, 14], 0x01);
  public static readonly ALPHANUMERIC = new Mode([9, 11, 13], 0x02);
  public static readonly STRUCTURED_APPEND = new Mode([0, 0, 0], 0x03);
  public static readonly BYTE = new Mode([8, 16, 16], 0x04);
  public static readonly ECI = new Mode([0, 0, 0], 0x07);
  public static readonly KANJI = new Mode([8, 10, 12], 0x08);
  public static readonly FNC1_FIRST_POSITION = new Mode([0, 0, 0], 0x05);
  public static readonly FNC1_SECOND_POSITION = new Mode([0, 0, 0], 0x09);
  public static readonly HANZI = new Mode([8, 10, 12], 0x0d);

  constructor(characterCountBitsSet: number[], bits: number) {
    this.#bits = bits;
    this.#characterCountBitsSet = new Int32Array(characterCountBitsSet);
  }

  public get bits(): number {
    return this.#bits;
  }

  public getCharacterCountBits({ version }: Version): number {
    let offset;

    if (version <= 9) {
      offset = 0;
    } else if (version <= 26) {
      offset = 1;
    } else {
      offset = 2;
    }

    return this.#characterCountBitsSet[offset];
  }
}
