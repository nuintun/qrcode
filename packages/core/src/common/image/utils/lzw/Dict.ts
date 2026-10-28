/**
 * @module Dict
 * @see https://github.com/google/dart-gif-encoder
 */

// The highest code that can be defined in the CodeBook.
const MAX_CODE = (1 << 12) - 1;

/**
 * A dict contains codes defined during LZW compression. It's a mapping from a string
 * of pixels to the code that represents it. The codes are stored in a flat table
 * indexed by `(code << depth) | index`. Codes may be up to 12 bits. The size of the
 * codebook is always the minimum power of 2 needed to represent all the codes and
 * automatically increases as new codes are defined. A table value of 0 means the
 * entry is unused (stored codes are always >= eof + 1).
 */
export class Dict {
  #bof: number;
  #eof: number;
  #bits!: number;
  #depth: number;
  #unused!: number;
  #table: Int32Array;

  constructor(depth: number) {
    this.#depth = depth;
    this.#bof = 1 << depth;
    this.#eof = this.#bof + 1;
    this.#table = new Int32Array((MAX_CODE + 1) << depth);

    this.reset();
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

  public reset(): void {
    this.#bits = this.#depth + 1;
    this.#unused = this.#eof + 1;

    this.#table.fill(0);
  }

  public add(code: number, index: number): boolean {
    const unused = this.#unused;

    if (unused > MAX_CODE) {
      return false;
    }

    this.#unused = unused + 1;
    this.#table[(code << this.#depth) | index] = unused;

    if (this.#unused > 1 << this.#bits) {
      this.#bits++;
    }

    return true;
  }

  public get(code: number, index: number): number {
    return this.#table[(code << this.#depth) | index];
  }
}
