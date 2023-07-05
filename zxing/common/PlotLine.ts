/**
 * @module PlotLine
 */

import { Point } from './Point';
import { toInt32 } from './utils';

// Mild variant of Bresenham's algorithm
// see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
export class PlotLine {
  #limit: number;
  #steep: boolean;
  #to: [x: number, y: number];
  #diff: [x: number, y: number];
  #from: [x: number, y: number];
  #delta: [x: number, y: number];

  constructor(from: Point, to: Point) {
    let toX = toInt32(to.x);
    let toY = toInt32(to.y);
    let fromX = toInt32(from.x);
    let fromY = toInt32(from.y);

    const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);

    // Steep line
    if (steep) {
      [fromX, fromY, toX, toY] = [fromY, fromX, toY, toX];
    }

    const deltaX = fromX < toX ? 1 : -1;

    this.#steep = steep;
    this.#to = [toX, toY];
    this.#limit = toX + deltaX;
    this.#from = [fromX, fromY];
    this.#delta = [deltaX, fromY < toY ? 1 : -1];
    this.#diff = [Math.abs(toX - fromX), Math.abs(toY - fromY)];
  }

  public get steep(): boolean {
    return this.#steep;
  }

  public get to(): Point {
    return new Point(...this.#to);
  }

  public get from(): Point {
    return new Point(...this.#from);
  }

  public get delta(): [x: number, y: number] {
    return [...this.#delta];
  }

  public *points(): Generator<[x: number, y: number]> {
    const [, toY] = this.#to;
    const steep = this.#steep;
    const limit = this.#limit;
    const [fromX, fromY] = this.#from;
    const [xDiff, yDiff] = this.#diff;
    const [deltaX, deltaY] = this.#delta;

    let error = toInt32(-xDiff / 2);

    // Loop up until x === toX, but not beyond
    for (let x = fromX, y = fromY; x !== limit; x += deltaX) {
      yield [steep ? y : x, steep ? x : y];

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
}
