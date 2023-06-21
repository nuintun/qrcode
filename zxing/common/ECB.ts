/**
 * @module ECB
 */

export class ECB {
  #count: number;
  #numDataCodewords: number;

  constructor(count: number, numDataCodewords: number) {
    this.#count = count;
    this.#numDataCodewords = numDataCodewords;
  }

  public get count(): number {
    return this.#count;
  }

  public get numDataCodewords(): number {
    return this.#numDataCodewords;
  }
}
