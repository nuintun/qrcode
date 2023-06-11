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

  /**
   * @property width
   * @description Get the width of matrix
   */
  public get width(): number {
    return this.#width;
  }

  /**
   * @property height
   * @description Get the height of matrix
   */
  public get height(): number {
    return this.#height;
  }

  /**
   * @method set
   * @description Set the matrix value of position
   */
  public set(x: number, y: number, value: number): void {
    this.#bytes[y * this.#width + x] = value;
  }

  /**
   * @method get
   * @description Get the matrix value of position
   */
  public get(x: number, y: number): number {
    return this.#bytes[y * this.#width + x];
  }

  /**
   * @method clear
   * @description Clear the matrix with value
   */
  public clear(value: number): void {
    this.#bytes.fill(value);
  }
}
