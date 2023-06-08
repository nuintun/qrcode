/**
 * @module BitMatrix
 */

export class BitMatrix {
  #width: number;
  #height: number;
  #rowSize: number;
  #bits: Int32Array;

  constructor(dimension: number);
  constructor(width: number, height: number);
  constructor(width: number, height: number, rowSize: number, bits: Int32Array);
  constructor(
    width: number,
    height: number = width,
    rowSize: number = Math.floor((width + 31) / 32),
    bits: Int32Array = new Int32Array(rowSize * height)
  ) {
    this.#bits = bits;
    this.#width = width;
    this.#height = height;
    this.#rowSize = rowSize;
  }

  #offset(x: number, y: number): number {
    return Math.floor(y * this.#rowSize + x / 32);
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public get rowSize(): number {
    return this.#rowSize;
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
        bits[Math.floor(offset + x / 32)] |= 1 << (x & 0x1f);
      }
    }
  }

  public clear(): void {
    this.#bits.fill(0);
  }
}
