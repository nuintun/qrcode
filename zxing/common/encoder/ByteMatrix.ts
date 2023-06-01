/**
 * @module ByteMatrix
 */

export class ByteMatrix {
  #width: number;
  #height: number;
  #bytes: Int8Array;

  constructor(dimension: number);
  constructor(width: number, height: number);
  constructor(width: number, height: number = width) {
    this.#width = width;
    this.#height = height;
    this.#bytes = new Int8Array(width * height);
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public set(x: number, y: number, value: number) {
    this.#bytes[y * this.#width + x] = value;
  }

  public get(x: number, y: number): number {
    return this.#bytes[y * this.#width + x];
  }

  public clear(value: number) {
    this.#bytes.fill(value);
  }
}
