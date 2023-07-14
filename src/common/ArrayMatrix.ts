/**
 * @module ArrayMatrix
 */

export class ArrayMatrix<
  T extends
    | Int8ArrayConstructor
    | Uint8ArrayConstructor
    | Int16ArrayConstructor
    | Uint16ArrayConstructor
    | Int32ArrayConstructor
    | Uint32ArrayConstructor
    | Float32ArrayConstructor
    | Float64ArrayConstructor
    | Uint8ClampedArrayConstructor
> {
  #width: number;
  #height: number;
  #matrix: InstanceType<T>;

  constructor(width: number, height: number, TypeArray: T = Int8Array as T) {
    this.#width = width;
    this.#height = height;
    this.#matrix = new TypeArray(width * height) as InstanceType<T>;
  }

  /**
   * @property width
   * @description Get the size of matrix
   */
  public get width(): number {
    return this.#width;
  }

  /**
   * @property width
   * @description Get the size of matrix
   */
  public get height(): number {
    return this.#height;
  }

  /**
   * @method set
   * @description Set the matrix value of position
   */
  public set(x: number, y: number, value: number): void {
    this.#matrix[y * this.#width + x] = value;
  }

  /**
   * @method get
   * @description Get the matrix value of position
   */
  public get(x: number, y: number): number {
    return this.#matrix[y * this.#width + x];
  }

  /**
   * @method clear
   * @description Clear the matrix with value
   */
  public clear(value: number): void {
    this.#matrix.fill(value);
  }
}
