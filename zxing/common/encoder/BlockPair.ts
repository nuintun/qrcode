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

  public get ecBytes() {
    return this.#ecBytes;
  }

  public get dataBytes() {
    return this.#dataBytes;
  }
}
