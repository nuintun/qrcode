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

  /**
   * @property size
   * @description Get the size of matrix
   */
  public get size(): number {
    return this.#size;
  }

  /**
   * @method set
   * @description Set the matrix value of position
   */
  public set(x: number, y: number, value: number): void {
    this.#bytes[y * this.#size + x] = value;
  }

  /**
   * @method get
   * @description Get the matrix value of position
   */
  public get(x: number, y: number): number {
    return this.#bytes[y * this.#size + x];
  }

  /**
   * @method clear
   * @description Clear the matrix with value
   */
  public clear(value: number): void {
    this.#bytes.fill(value);
  }
}
