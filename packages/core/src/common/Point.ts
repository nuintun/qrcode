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

  /**
   * @property x
   * @description Get the x of point.
   */
  public get x(): number {
    return this.#x;
  }

  /**
   * @property y
   * @description Get the y of point.
   */
  public get y(): number {
    return this.#y;
  }
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt(squaredDistance(a, b));
}

export function squaredDistance(a: Point, b: Point): number {
  const xDiff = a.x - b.x;
  const yDiff = a.y - b.y;

  return xDiff * xDiff + yDiff * yDiff;
}

export function calculateTriangleArea(a: Point, b: Point, c: Point): number {
  const { x: ax, y: ay } = a;
  const { x: bx, y: by } = b;
  const { x: cx, y: cy } = c;

  return Math.abs(ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) / 2;
}
