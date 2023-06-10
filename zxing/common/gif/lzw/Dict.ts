/**
 * @module Dict
 */

// The highest code that can be defined in the CodeBook.
const MAX_CODE = (1 << 12) - 1;

/**
 * A dict contains codes defined during LZW compression. It's a mapping from a string
 * of pixels to the code that represents it. The codes are stored in a trie which is
 * represented as a map. Codes may be up to 12 bits. The size of the codebook is always
 * the minimum power of 2 needed to represent all the codes and automatically increases
 * as new codes are defined.
 */
export class Dict {
  #bof: number;
  #eof: number;
  #bits: number;
  #size: number;
  #depth: number;
  #unused: number;
  #codes: number[] = [];

  constructor(depth: number) {
    const bits = depth + 1;
    const bof = 1 << depth;
    const eof = bof + 1;

    this.#bof = bof;
    this.#eof = eof;
    this.#bits = bits;
    this.#depth = depth;
    this.#size = 1 << bits;
    this.#unused = eof + 1;
  }

  public get bof(): number {
    return this.#bof;
  }

  public get eof(): number {
    return this.#eof;
  }

  public get bits(): number {
    return this.#bits;
  }

  public get depth(): number {
    return this.#depth;
  }

  public add(code: number, index: number): void {
    let unused = this.#unused;

    if (unused < MAX_CODE) {
      this.#codes[(code << 8) | index] = unused++;

      let bits = this.#bits;
      let size = this.#size;

      if (unused > size) {
        size = 1 << ++bits;
      }

      this.#bits = bits;
      this.#size = size;
      this.#unused = unused;
    }
  }

  public codeAfterAppend(code: number, index: number): number {
    return this.#codes[(code << 8) | index];
  }
}
