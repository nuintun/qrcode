/**
 * @module BitMatrix
 */

export class BitMatrix {
  #size: number;
  #rowSize: number;
  #bits: Int32Array;

  constructor(size: number) {
    const rowSize = Math.ceil(size / 32);

    this.#size = size;
    this.#rowSize = rowSize;
    this.#bits = new Int32Array(rowSize * size);
  }

  #offset(x: number, y: number): number {
    return y * this.#rowSize + Math.floor(x / 32);
  }

  public get size(): number {
    return this.#size;
  }

  public set(x: number, y: number): void {
    const offset = this.#offset(x, y);

    this.#bits[offset] |= 1 << (x & 0x1f);
  }

  public get(x: number, y: number): number {
    const offset = this.#offset(x, y);

    return (this.#bits[offset] >>> (x & 0x1f)) & 1;
  }

  public flip(x: number, y: number): void {
    const offset = this.#offset(x, y);

    this.#bits[offset] ^= 1 << (x & 0x1f);
  }

  public setRegion(left: number, top: number, width: number, height: number): void {
    const bits = this.#bits;
    const right = left + width;
    const bottom = top + height;
    const rowSize = this.#rowSize;

    for (let y = top; y < bottom; y++) {
      const offset = y * rowSize;

      for (let x = left; x < right; x++) {
        bits[offset + Math.floor(x / 32)] |= 1 << (x & 0x1f);
      }
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
