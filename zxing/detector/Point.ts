/**
 * @module Point
 */

export class Point {
  #x: number;
  #y: number;

  constructor(x: number, y: number) {
    this.#x = x;
    this.#y = y;
  }

  public get x(): number {
    return this.#x;
  }

  public get y(): number {
    return this.#y;
  }
}
