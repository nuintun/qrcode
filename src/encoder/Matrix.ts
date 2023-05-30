/**
 * @module Matrix
 */

export class Matrix {
  #size: number;
  #matrix: number[];

  constructor(size: number) {
    this.#matrix = [];
    this.#size = size;
  }

  public get size(): number {
    return this.#size;
  }

  public get(x: number, y: number): number {
    return this.#matrix[y * this.#size + x];
  }

  public set(x: number, y: number, value: number): void {
    this.#matrix[y * this.#size + x] = value;
  }
}

export function isDark(matrix: Matrix, x: number, y: number): boolean {
  return matrix.get(x, y) === 1;
}

export function isEmpty(matrix: Matrix, x: number, y: number): boolean {
  return matrix.get(x, y) === undefined;
}
