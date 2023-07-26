/**
 * @module DataBlock
 */

export class DataBlock {
  #codewords: Uint8Array;
  #numDataCodewords: number;

  constructor(codewords: Uint8Array, numDataCodewords: number) {
    this.#codewords = codewords;
    this.#numDataCodewords = numDataCodewords;
  }

  public get codewords(): Uint8Array {
    return this.#codewords;
  }

  public get numDataCodewords(): number {
    return this.#numDataCodewords;
  }
}
