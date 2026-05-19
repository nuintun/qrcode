/**
 * @module RegressionLine
 */

import { Point } from '/common/Point';

type RegressionMode = 'yByX' | 'xByY';

export class RegressionLine {
  #mode: RegressionMode;
  #slope: number;

  constructor(points: Point[]) {
    if (points.length < 2) {
      throw new Error('RegressionLine requires at least 2 points');
    }

    const xMean = points.reduce((sum, { x }) => sum + x, 0) / points.length;
    const yMean = points.reduce((sum, { y }) => sum + y, 0) / points.length;
    const sxx = points.reduce((sum, { x }) => sum + (x - xMean) * (x - xMean), 0);
    const syy = points.reduce((sum, { y }) => sum + (y - yMean) * (y - yMean), 0);

    if (sxx >= syy) {
      // y = slope * x + intercept
      const sxy = points.reduce((sum, { x, y }) => sum + (x - xMean) * (y - yMean), 0);

      this.#mode = 'yByX';
      this.#slope = sxx === 0 ? 0 : sxy / sxx;
    } else {
      // x = slope * y + intercept
      const syx = points.reduce((sum, { x, y }) => sum + (y - yMean) * (x - xMean), 0);

      this.#mode = 'xByY';
      this.#slope = syy === 0 ? 0 : syx / syy;
    }
  }

  public direction(): Point {
    if (this.#mode === 'yByX') {
      const dx = 1;
      const dy = this.#slope;

      return new Point(dx, dy);
    }

    const dx = this.#slope;
    const dy = 1;

    return new Point(dx, dy);
  }
}
