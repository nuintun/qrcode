/**
 * @module BlockPair
 */

export class BlockPair {
  #ecBytes: Int8Array;
  #dataBytes: Int8Array;

  constructor(dataBytes: Int8Array, ecBytes: Int8Array) {
    this.#ecBytes = ecBytes;
    this.#dataBytes = dataBytes;
  }

  public get ecBytes(): Int8Array {
    return this.#ecBytes;
  }

  public get dataBytes(): Int8Array {
    return this.#dataBytes;
  }
}
