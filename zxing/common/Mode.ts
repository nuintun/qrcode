/**
 * @module Mode
 */

import { Version } from './Version';

export class Mode {
  #bits: number;
  #characterCountBitsSet: Int32Array;

  public static TERMINATOR = new Mode([0, 0, 0], 0x00);
  public static NUMERIC = new Mode([10, 12, 14], 0x01);
  public static ALPHANUMERIC = new Mode([9, 11, 13], 0x02);
  public static STRUCTURED_APPEND = new Mode([0, 0, 0], 0x03);
  public static BYTE = new Mode([8, 16, 16], 0x04);
  public static ECI = new Mode([0, 0, 0], 0x07);
  public static KANJI = new Mode([8, 10, 12], 0x08);
  public static FNC1_FIRST_POSITION = new Mode([0, 0, 0], 0x05);
  public static FNC1_SECOND_POSITION = new Mode([0, 0, 0], 0x09);
  public static HANZI = new Mode([8, 10, 12], 0x0d);

  constructor(characterCountBitsSet: number[], bits: number) {
    this.#bits = bits;
    this.#characterCountBitsSet = new Int32Array(characterCountBitsSet);
  }

  public get bits(): number {
    return this.#bits;
  }

  public getCharacterCountBits({ version }: Version) {
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
