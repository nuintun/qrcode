/**
 * @module ByteMatrix
 */

export class ByteMatrix {
  #size: number;
  #bytes: Int8Array;

  constructor(size: number) {
    this.#size = size;
    this.#bytes = new Int8Array(size * size);
  }

  public get size(): number {
    return this.#size;
  }

  public set(x: number, y: number, value: number): void {
    this.#bytes[y * this.#size + x] = value;
  }

  public get(x: number, y: number): number {
    return this.#bytes[y * this.#size + x];
  }

  public clear(value: number): void {
    this.#bytes.fill(value);
  }
}
