/**
 * @module PlotLine
 */

import { Point } from './Point';
import { toUint32 } from './utils';

// Mild variant of Bresenham's algorithm.
// see https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm
export class PlotLine {
  #to: Point;
  #from: Point;
  #limit: number;
  #steep: boolean;
  #step: [x: number, y: number];
  #delta: [x: number, y: number];

  constructor(from: Point, to: Point) {
    let toX = toUint32(to.x);
    let toY = toUint32(to.y);
    let fromX = toUint32(from.x);
    let fromY = toUint32(from.y);

    const steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);

    // Steep line.
    if (steep) {
      [fromX, fromY, toX, toY] = [fromY, fromX, toY, toX];
    }

    const stepX = fromX < toX ? 1 : -1;

    this.#steep = steep;
    this.#limit = toX + stepX;
    this.#to = new Point(toX, toY);
    this.#from = new Point(fromX, fromY);
    this.#step = [stepX, fromY < toY ? 1 : -1];
    this.#delta = [Math.abs(toX - fromX), Math.abs(toY - fromY)];
  }

  public *points(): Generator<[x: number, y: number]> {
    const limit = this.#limit;
    const steep = this.#steep;
    const { y: toY } = this.#to;
    const [stepX, stepY] = this.#step;
    const [deltaX, deltaY] = this.#delta;
    const { x: fromX, y: fromY } = this.#from;

    let error = (-deltaX / 2) | 0;

    // Loop up until x === toX, but not beyond.
    for (let x = fromX, y = fromY; x !== limit; x += stepX) {
      yield [steep ? y : x, steep ? x : y];

      error += deltaY;

      if (error > 0) {
        if (y === toY) {
          break;
        }

        y += stepY;
        error -= deltaX;
      }
    }
  }
}
