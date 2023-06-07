/**
 * @module BlockPair
 */

export class BlockPair {
  #ecBytes: Uint8Array;
  #dataBytes: Uint8Array;

  constructor(dataBytes: Uint8Array, ecBytes: Uint8Array) {
    this.#ecBytes = ecBytes;
    this.#dataBytes = dataBytes;
  }

  public get ecBytes(): Uint8Array {
    return this.#ecBytes;
  }

  public get dataBytes(): Uint8Array {
    return this.#dataBytes;
  }
}
