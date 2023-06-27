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

export function distance(point1: Point, point2: Point): number {
  const xDiff = point1.x - point2.x;
  const yDiff = point1.y - point2.y;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}
