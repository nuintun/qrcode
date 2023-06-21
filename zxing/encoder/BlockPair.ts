/**
 * @module BlockPair
 */

export class BlockPair {
  #ecCodewords: Uint8Array;
  #dataCodewords: Uint8Array;

  constructor(dataCodewords: Uint8Array, ecCodewords: Uint8Array) {
    this.#ecCodewords = ecCodewords;
    this.#dataCodewords = dataCodewords;
  }

  public get ecCodewords(): Uint8Array {
    return this.#ecCodewords;
  }

  public get dataCodewords(): Uint8Array {
    return this.#dataCodewords;
  }
}
