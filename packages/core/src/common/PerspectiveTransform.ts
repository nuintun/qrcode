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

  public buildAdjoint(): PerspectiveTransform {
    // Adjoint is the transpose of the cofactor matrix.
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
    const b11 = other.#a11;
    const b12 = other.#a12;
    const b13 = other.#a13;
    const b21 = other.#a21;
    const b22 = other.#a22;
    const b23 = other.#a23;
    const b31 = other.#a31;
    const b32 = other.#a32;
    const b33 = other.#a33;

    return new PerspectiveTransform(
      a11 * b11 + a21 * b12 + a31 * b13,
      a11 * b21 + a21 * b22 + a31 * b23,
      a11 * b31 + a21 * b32 + a31 * b33,
      a12 * b11 + a22 * b12 + a32 * b13,
      a12 * b21 + a22 * b22 + a32 * b23,
      a12 * b31 + a22 * b32 + a32 * b33,
      a13 * b11 + a23 * b12 + a33 * b13,
      a13 * b21 + a23 * b22 + a33 * b23,
      a13 * b31 + a23 * b32 + a33 * b33
    );
  }

  public mapping(x: number, y: number): [x: number, y: number] {
    const a11 = this.#a11;
    const a12 = this.#a12;
    const a13 = this.#a13;
    const a21 = this.#a21;
    const a22 = this.#a22;
    const a23 = this.#a23;
    const a31 = this.#a31;
    const a32 = this.#a32;
    const a33 = this.#a33;
    const denominator = a13 * x + a23 * y + a33;

    return [(a11 * x + a21 * y + a31) / denominator, (a12 * x + a22 * y + a32) / denominator];
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
  // Here, the adjoint serves as the inverse.
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
