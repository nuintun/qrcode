/**
 * @module PlotLine
 */

import { Point } from './Point';
import { toInt32 } from './utils';

// Mild variant of Bresenham's algorithm
// see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
export class PlotLine {
  #to: Point;
  #from: Point;
  #limit: number;
  #steep: boolean;
  #diff: [x: number, y: number];
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
    this.#limit = toX + deltaX;
    this.#to = new Point(toX, toY);
    this.#from = new Point(fromX, fromY);
    this.#delta = [deltaX, fromY < toY ? 1 : -1];
    this.#diff = [Math.abs(toX - fromX), Math.abs(toY - fromY)];
  }

  public get to(): Point {
    return this.#to;
  }

  public get from(): Point {
    return this.#from;
  }

  public get steep(): boolean {
    return this.#steep;
  }

  public get delta(): [x: number, y: number] {
    return this.#delta;
  }

  public *points(): Generator<[x: number, y: number]> {
    const limit = this.#limit;
    const steep = this.#steep;
    const { y: toY } = this.#to;
    const [xDiff, yDiff] = this.#diff;
    const [deltaX, deltaY] = this.#delta;
    const { x: fromX, y: fromY } = this.#from;

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