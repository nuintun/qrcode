/**
 * @module Mode
 */

import { Version } from './Version';

export class Mode {
  #bits: number;
  #characterCountBitsForVersions: Int32Array;

  constructor(bits: number, characterCountBitsForVersions: Int32Array) {
    this.#bits = bits;
    this.#characterCountBitsForVersions = characterCountBitsForVersions;
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

    return this.#characterCountBitsForVersions[offset];
  }
}
