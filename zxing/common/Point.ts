/**
 * @module Point
 */

import { toInt32 } from './utils';

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

// Mild variant of Bresenham's algorithm
// see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
export function plotLine(from: Point, to: Point, callback: PlotLineCallback): void {
  let toX = toInt32(to.x);
  let toY = toInt32(to.y);
  let fromX = toInt32(from.x);
  let fromY = toInt32(from.y);

  const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);

  // Swap coordinate
  if (steep) {
    [fromX, fromY, toX, toY] = [fromY, fromX, toY, toX];
  }

  const xDiff = Math.abs(toX - fromX);
  const yDiff = Math.abs(toY - fromY);
  const deltaX = fromX < toX ? 1 : -1;
  const deltaY = fromY < toY ? 1 : -1;
  const xLimit = toX + deltaX;

  let error = toInt32(-xDiff / 2);

  // Loop up until x === toX, but not beyond
  for (let x = fromX, y = fromY; x !== xLimit; x += deltaX) {
    if (callback(steep ? y : x, steep ? x : y, deltaX, deltaY) === false) {
      break;
    }

    error += yDiff;

    if (error > 0) {
      if (y === toY) {
        break;
      }

      y += deltaY;
      error -= xDiff;
    }
  }
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
