/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * <p>This class implements a perspective transform in two dimensions. Given four source and four
 * destination points, it will compute the transformation implied between them. The code is based
 * directly upon section 3.4.2 of George Wolberg's "Digital Image Warping"; see pages 54-56.</p>
 *
 * @author Sean Owen
 */
export default class PerspectiveTransform {
  private a11: number;
  private a21: number;
  private a31: number;
  private a12: number;
  private a22: number;
  private a32: number;
  private a13: number;
  private a23: number;
  private a33: number;

  /**
   * @constructor
   * @param a11
   * @param a21
   * @param a31
   * @param a12
   * @param a22
   * @param a32
   * @param a13
   * @param a23
   * @param a33
   */
  private constructor(
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
    this.a11 = a11;
    this.a12 = a12;
    this.a13 = a13;
    this.a21 = a21;
    this.a22 = a22;
    this.a23 = a23;
    this.a31 = a31;
    this.a32 = a32;
    this.a33 = a33;
  }

  public static quadrilateralToQuadrilateral(
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
  ): PerspectiveTransform {
    const qToS: PerspectiveTransform = PerspectiveTransform.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3);
    const sToQ: PerspectiveTransform = PerspectiveTransform.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);

    return sToQ.times(qToS);
  }

  public transformPoints(points: Float32Array): void {
    const max: number = points.length;

    const a11: number = this.a11;
    const a12: number = this.a12;
    const a13: number = this.a13;
    const a21: number = this.a21;
    const a22: number = this.a22;
    const a23: number = this.a23;
    const a31: number = this.a31;
    const a32: number = this.a32;
    const a33: number = this.a33;

    for (let i: number = 0; i < max; i += 2) {
      const x: number = points[i];
      const y: number = points[i + 1];
      const denominator: number = a13 * x + a23 * y + a33;

      points[i] = (a11 * x + a21 * y + a31) / denominator;
      points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  public transformPointsWithValues(xValues: Float32Array, yValues: Float32Array): void {
    const a11: number = this.a11;
    const a12: number = this.a12;
    const a13: number = this.a13;
    const a21: number = this.a21;
    const a22: number = this.a22;
    const a23: number = this.a23;
    const a31: number = this.a31;
    const a32: number = this.a32;
    const a33: number = this.a33;

    const n: number = xValues.length;

    for (let i: number = 0; i < n; i++) {
      const x: number = xValues[i];
      const y: number = yValues[i];
      const denominator: number = a13 * x + a23 * y + a33;

      xValues[i] = (a11 * x + a21 * y + a31) / denominator;
      yValues[i] = (a12 * x + a22 * y + a32) / denominator;
    }
  }

  public static squareToQuadrilateral(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number
  ): PerspectiveTransform {
    const dx3: number = x0 - x1 + x2 - x3;
    const dy3: number = y0 - y1 + y2 - y3;

    if (dx3 === 0.0 && dy3 === 0.0) {
      // Affine
      return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0.0, 0.0, 1.0);
    } else {
      const dx1: number = x1 - x2;
      const dx2: number = x3 - x2;
      const dy1: number = y1 - y2;
      const dy2: number = y3 - y2;

      const denominator: number = dx1 * dy2 - dx2 * dy1;

      const a13: number = (dx3 * dy2 - dx2 * dy3) / denominator;
      const a23: number = (dx1 * dy3 - dx3 * dy1) / denominator;

      return new PerspectiveTransform(
        x1 - x0 + a13 * x1,
        x3 - x0 + a23 * x3,
        x0,
        y1 - y0 + a13 * y1,
        y3 - y0 + a23 * y3,
        y0,
        a13,
        a23,
        1.0
      );
    }
  }

  public static quadrilateralToSquare(
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
    return PerspectiveTransform.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
  }

  protected buildAdjoint(): PerspectiveTransform {
    // Adjoint is the transpose of the cofactor matrix:
    return new PerspectiveTransform(
      this.a22 * this.a33 - this.a23 * this.a32,
      this.a23 * this.a31 - this.a21 * this.a33,
      this.a21 * this.a32 - this.a22 * this.a31,
      this.a13 * this.a32 - this.a12 * this.a33,
      this.a11 * this.a33 - this.a13 * this.a31,
      this.a12 * this.a31 - this.a11 * this.a32,
      this.a12 * this.a23 - this.a13 * this.a22,
      this.a13 * this.a21 - this.a11 * this.a23,
      this.a11 * this.a22 - this.a12 * this.a21
    );
  }

  protected times(other: PerspectiveTransform): PerspectiveTransform {
    return new PerspectiveTransform(
      this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13,
      this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23,
      this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33,
      this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13,
      this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23,
      this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33,
      this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13,
      this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23,
      this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33
    );
  }
}
