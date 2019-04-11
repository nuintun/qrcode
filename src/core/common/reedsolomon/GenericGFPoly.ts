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

import GenericGF from './GenericGF';
import System from '../../util/System';
import StringBuilder from '../../util/StringBuilder';
import IllegalArgumentException from '../../IllegalArgumentException';

/**
 * <p>Represents a polynomial whose coefficients are elements of a GF.
 * Instances of this class are immutable.</p>
 *
 * <p>Much credit is due to William Rucklidge since portions of this code are an indirect
 * port of his C++ Reed-Solomon implementation.</p>
 *
 * @author Sean Owen
 */
export default class GenericGFPoly {
  private field: GenericGF;
  private coefficients: Int32Array;

  /**
   * @constructor
   * @param field the {@link GenericGF} instance representing the field to use
   * to perform computations
   * @param coefficients coefficients as ints representing elements of GF(size), arranged
   * from most significant (highest-power term) coefficient to least significant
   * @throws IllegalArgumentException if argument is null or empty,
   * or if leading coefficient is 0 and this is not a
   * constant polynomial (that is, it is not the monomial "0")
   */
  public constructor(field: GenericGF, coefficients: Int32Array) {
    if (coefficients.length === 0) {
      throw new IllegalArgumentException();
    }

    this.field = field;

    const coefficientsLength: number = coefficients.length;

    if (coefficientsLength > 1 && coefficients[0] === 0) {
      // Leading term must be non-zero for anything except the constant polynomial "0"
      let firstNonZero: number = 1;

      while (firstNonZero < coefficientsLength && coefficients[firstNonZero] === 0) {
        firstNonZero++;
      }

      if (firstNonZero === coefficientsLength) {
        this.coefficients = Int32Array.from([0]);
      } else {
        this.coefficients = new Int32Array(coefficientsLength - firstNonZero);
        System.arraycopy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
      }
    } else {
      this.coefficients = coefficients;
    }
  }

  public getCoefficients(): Int32Array {
    return this.coefficients;
  }

  /**
   * @return degree of this polynomial
   */
  public getDegree(): number {
    return this.coefficients.length - 1;
  }

  /**
   * @return true iff this polynomial is the monomial "0"
   */
  public isZero(): boolean {
    return this.coefficients[0] === 0;
  }

  /**
   * @return coefficient of x^degree term in this polynomial
   */
  public getCoefficient(degree: number): number {
    return this.coefficients[this.coefficients.length - 1 - degree];
  }

  /**
   * @return evaluation of this polynomial at a given point
   */
  public evaluateAt(a: number): number {
    if (a === 0) {
      // Just return the x^0 coefficient
      return this.getCoefficient(0);
    }

    let result: number;
    const coefficients: Int32Array = this.coefficients;

    if (a === 1) {
      // Just the sum of the coefficients
      result = 0;

      for (let i: number = 0, length: number = coefficients.length; i !== length; i++) {
        const coefficient: number = coefficients[i];

        result = GenericGF.addOrSubtract(result, coefficient);
      }

      return result;
    }

    result = coefficients[0];

    const field: GenericGF = this.field;
    const size: number = coefficients.length;

    for (let i: number = 1; i < size; i++) {
      result = GenericGF.addOrSubtract(field.multiply(a, result), coefficients[i]);
    }

    return result;
  }

  public addOrSubtract(other: GenericGFPoly): GenericGFPoly {
    if (!this.field.equals(other.field)) {
      throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
    }

    if (this.isZero()) {
      return other;
    }

    if (other.isZero()) {
      return this;
    }

    let smallerCoefficients: Int32Array = this.coefficients;
    let largerCoefficients: Int32Array = other.coefficients;

    if (smallerCoefficients.length > largerCoefficients.length) {
      [smallerCoefficients, largerCoefficients] = [largerCoefficients, smallerCoefficients];
    }

    const sumDiff: Int32Array = new Int32Array(largerCoefficients.length);
    const lengthDiff: number = largerCoefficients.length - smallerCoefficients.length;

    // Copy high-order terms only found in higher-degree polynomial's coefficients
    System.arraycopy(largerCoefficients, 0, sumDiff, 0, lengthDiff);

    for (let i: number = lengthDiff; i < largerCoefficients.length; i++) {
      sumDiff[i] = GenericGF.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
    }

    return new GenericGFPoly(this.field, sumDiff);
  }

  public multiply(other: GenericGFPoly): GenericGFPoly {
    const field: GenericGF = this.field;

    if (!field.equals(other.field)) {
      throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
    }

    if (this.isZero() || other.isZero()) {
      return field.getZero();
    }

    const aCoefficients: Int32Array = this.coefficients;
    const aLength: number = aCoefficients.length;
    const bCoefficients: Int32Array = other.coefficients;
    const bLength: number = bCoefficients.length;
    const product: Int32Array = new Int32Array(aLength + bLength - 1);

    for (let i = 0; i < aLength; i++) {
      const aCoeff: number = aCoefficients[i];

      for (let j: number = 0; j < bLength; j++) {
        product[i + j] = GenericGF.addOrSubtract(product[i + j], field.multiply(aCoeff, bCoefficients[j]));
      }
    }

    return new GenericGFPoly(field, product);
  }

  public multiplyScalar(scalar: number): GenericGFPoly {
    const field: GenericGF = this.field;

    if (scalar === 0) {
      return field.getZero();
    }

    if (scalar === 1) {
      return this;
    }

    const size: number = this.coefficients.length;
    const product: Int32Array = new Int32Array(size);
    const coefficients: Int32Array = this.coefficients;

    for (let i: number = 0; i < size; i++) {
      product[i] = field.multiply(coefficients[i], scalar);
    }

    return new GenericGFPoly(field, product);
  }

  public multiplyByMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) {
      throw new IllegalArgumentException();
    }

    const field: GenericGF = this.field;

    if (coefficient === 0) {
      return field.getZero();
    }

    const coefficients: Int32Array = this.coefficients;
    const size: number = coefficients.length;
    const product: Int32Array = new Int32Array(size + degree);

    for (let i: number = 0; i < size; i++) {
      product[i] = field.multiply(coefficients[i], coefficient);
    }

    return new GenericGFPoly(field, product);
  }

  public divide(other: GenericGFPoly): GenericGFPoly[] {
    const field: GenericGF = this.field;

    if (!field.equals(other.field)) {
      throw new IllegalArgumentException('GenericGFPolys do not have same GenericGF field');
    }

    if (other.isZero()) {
      throw new IllegalArgumentException('Divide by 0');
    }

    let quotient: GenericGFPoly = field.getZero();
    let remainder: GenericGFPoly = this;
    const denominatorLeadingTerm: number = other.getCoefficient(other.getDegree());
    const inverseDenominatorLeadingTerm: number = field.inverse(denominatorLeadingTerm);

    while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
      const degreeDifference: number = remainder.getDegree() - other.getDegree();
      const scale: number = field.multiply(remainder.getCoefficient(remainder.getDegree()), inverseDenominatorLeadingTerm);
      const term: GenericGFPoly = other.multiplyByMonomial(degreeDifference, scale);
      const iterationQuotient: GenericGFPoly = field.buildMonomial(degreeDifference, scale);

      quotient = quotient.addOrSubtract(iterationQuotient);
      remainder = remainder.addOrSubtract(term);
    }

    return [quotient, remainder];
  }

  /**
   * @override
   */
  public toString(): string {
    if (this.isZero()) {
      return '0';
    }

    const result: StringBuilder = new StringBuilder();

    for (let degree = this.getDegree(); degree >= 0; degree--) {
      let coefficient: number = this.getCoefficient(degree);

      if (coefficient !== 0) {
        if (coefficient < 0) {
          if (degree == this.getDegree()) {
            result.append('-');
          } else {
            result.append(' - ');
          }

          coefficient = -coefficient;
        } else {
          if (result.length() > 0) {
            result.append(' + ');
          }
        }

        if (degree === 0 || coefficient !== 1) {
          const alphaPower: number = this.field.log(coefficient);

          if (alphaPower === 0) {
            result.append('1');
          } else if (alphaPower === 1) {
            result.append('a');
          } else {
            result.append('a^');
            result.append(alphaPower);
          }
        }

        if (degree !== 0) {
          if (degree === 1) {
            result.append('x');
          } else {
            result.append('x^');
            result.append(degree);
          }
        }
      }
    }

    return result.toString();
  }
}
