/**
 * @module ECB
 */

export class ECB {
  #count: number;
  #dataCodewords: number;

  constructor(count: number, dataCodewords: number) {
    this.#count = count;
    this.#dataCodewords = dataCodewords;
  }

  public get count(): number {
    return this.#count;
  }

  public get dataCodewords(): number {
    return this.#dataCodewords;
  }
}
