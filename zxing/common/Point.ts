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

export function distance(a: Point, b: Point): number {
  const xDiff = a.x - b.x;
  const yDiff = a.y - b.y;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

export interface PlotLineCallback {
  (x: number, y: number, deltaX: number, deltaY: number): void | boolean;
}

export function calcTriangleArea(a: Point, b: Point, c: Point): number {
  return Math.abs((a.x * b.y + b.x * c.y + c.x * a.y - b.x * a.y - c.x * b.y - a.x * c.y) / 2);
}

export function isPointInQuadrangle(p: Point, a: Point, b: Point, c: Point, d: Point): boolean {
  return (
    calcTriangleArea(a, b, c) + calcTriangleArea(c, d, a) ===
    calcTriangleArea(a, b, p) + calcTriangleArea(b, c, p) + calcTriangleArea(c, d, p) + calcTriangleArea(d, a, p)
  );
}
