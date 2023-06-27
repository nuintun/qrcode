/**
 * @module PerspectiveTransform
 */

export class PerspectiveTransform {
  #a11: number;
  #a12: number;
  #a13: number;
  #a21: number;
  #a22: number;
  #a23: number;
  #a31: number;
  #a32: number;
  #a33: number;

  constructor(
    a11: number,
    a21: number,
    a31: number,
    a12: number,
    a22: number,
    a32: number,
    a13: number,
    a23: number,
    a33: number
  ) {
    this.#a11 = a11;
    this.#a12 = a12;
    this.#a13 = a13;
    this.#a21 = a21;
    this.#a22 = a22;
    this.#a23 = a23;
    this.#a31 = a31;
    this.#a32 = a32;
    this.#a33 = a33;
  }

  public buildAdjoint() {
    // Adjoint is the transpose of the cofactor matrix:
    const a11 = this.#a11;
    const a12 = this.#a12;
    const a13 = this.#a13;
    const a21 = this.#a21;
    const a22 = this.#a22;
    const a23 = this.#a23;
    const a31 = this.#a31;
    const a32 = this.#a32;
    const a33 = this.#a33;

    return new PerspectiveTransform(
      a22 * a33 - a23 * a32,
      a23 * a31 - a21 * a33,
      a21 * a32 - a22 * a31,
      a13 * a32 - a12 * a33,
      a11 * a33 - a13 * a31,
      a12 * a31 - a11 * a32,
      a12 * a23 - a13 * a22,
      a13 * a21 - a11 * a23,
      a11 * a22 - a12 * a21
    );
  }

  public transformPoints(points: number[]): void {
    const a11 = this.#a11;
    const a12 = this.#a12;
    const a13 = this.#a13;
    const a21 = this.#a21;
    const a22 = this.#a22;
    const a23 = this.#a23;
    const a31 = this.#a31;
    const a32 = this.#a32;
    const a33 = this.#a33;
    const max = points.length;

    for (let i = 0; i < max; i += 2) {
      const x = points[i];
      const y = points[i + 1];
      const denominator = a13 * x + a23 * y + a33;

      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  public times(other: PerspectiveTransform): PerspectiveTransform {
    const a11 = this.#a11;
    const a12 = this.#a12;
    const a13 = this.#a13;
    const a21 = this.#a21;
    const a22 = this.#a22;
    const a23 = this.#a23;
    const a31 = this.#a31;
    const a32 = this.#a32;
    const a33 = this.#a33;
    const o11 = other.#a11;
    const o12 = other.#a12;
    const o13 = other.#a13;
    const o21 = other.#a21;
    const o22 = other.#a22;
    const o23 = other.#a23;
    const o31 = other.#a31;
    const o32 = other.#a32;
    const o33 = other.#a33;

    return new PerspectiveTransform(
      a11 * o11 + a21 * o12 + a31 * o13,
      a11 * o21 + a21 * o22 + a31 * o23,
      a11 * o31 + a21 * o32 + a31 * o33,
      a12 * o11 + a22 * o12 + a32 * o13,
      a12 * o21 + a22 * o22 + a32 * o23,
      a12 * o31 + a22 * o32 + a32 * o33,
      a13 * o11 + a23 * o12 + a33 * o13,
      a13 * o21 + a23 * o22 + a33 * o23,
      a13 * o31 + a23 * o32 + a33 * o33
    );
  }
}

function squareToQuadrilateral(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
): PerspectiveTransform {
  const dx3 = x0 - x1 + x2 - x3;
  const dy3 = y0 - y1 + y2 - y3;

  if (dx3 === 0 && dy3 === 0) {
    return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0, 1);
  } else {
    const dx1 = x1 - x2;
    const dx2 = x3 - x2;
    const dy1 = y1 - y2;
    const dy2 = y3 - y2;
    const denominator = dx1 * dy2 - dx2 * dy1;
    const a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
    const a23 = (dx1 * dy3 - dx3 * dy1) / denominator;

    return new PerspectiveTransform(
      x1 - x0 + a13 * x1,
      x3 - x0 + a23 * x3,
      x0,
      y1 - y0 + a13 * y1,
      y3 - y0 + a23 * y3,
      y0,
      a13,
      a23,
      1
    );
  }
}

function quadrilateralToSquare(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number
): PerspectiveTransform {
  // Here, the adjoint serves as the inverse:
  return squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
}

export function quadrilateralToQuadrilateral(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x0p: number,
  y0p: number,
  x1p: number,
  y1p: number,
  x2p: number,
  y2p: number,
  x3p: number,
  y3p: number
) {
  const qToS = quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
  const sToQ = squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);

  return sToQ.times(qToS);
}
