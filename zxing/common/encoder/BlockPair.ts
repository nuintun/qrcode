/**
 * @module BlockPair
 */

export class BlockPair {
  #ecBytes: Int8Array;
  #dataBytes: Int8Array;

  constructor(data: Int8Array, ecBytes: Int8Array) {
    this.#dataBytes = data;
    this.#ecBytes = ecBytes;
  }

  public get ecBytes() {
    return this.#ecBytes;
  }

  public get dataBytes() {
    return this.#dataBytes;
  }
}
