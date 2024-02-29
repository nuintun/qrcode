/**
 * @module Polynomial
 */

import { GaloisField } from './GaloisField';

export class Polynomial {
  #field: GaloisField;
  #coefficients: Int32Array;

  constructor(field: GaloisField, coefficients: Int32Array) {
    const { length } = coefficients;

    if (length <= 0) {
      throw new Error('polynomial coefficients cannot empty');
    }

    this.#field = field;

    if (length > 1 && coefficients[0] === 0) {
      // Leading term must be non-zero for anything except the constant polynomial "0".
      let firstNonZero = 1;

      while (firstNonZero < length && coefficients[firstNonZero] === 0) {
        firstNonZero++;
      }

      if (firstNonZero === length) {
        this.#coefficients = new Int32Array([0]);
      } else {
        const array = new Int32Array(length - firstNonZero);

        array.set(coefficients.subarray(firstNonZero));

        this.#coefficients = array;
      }
    } else {
      this.#coefficients = coefficients;
    }
  }

  public get coefficients(): Int32Array {
    return this.#coefficients;
  }

  public isZero(): boolean {
    return this.#coefficients[0] === 0;
  }

  public getDegree(): number {
    return this.#coefficients.length - 1;
  }

  public getCoefficient(degree: number): number {
    const coefficients = this.#coefficients;

    return coefficients[coefficients.length - 1 - degree];
  }

  public evaluate(a: number): number {
    if (a === 0) {
      // Just return the x^0 coefficient.
      return this.getCoefficient(0);
    }

    let result: number;

    const coefficients = this.#coefficients;

    if (a === 1) {
      // Just the sum of the coefficients.
      result = 0;

      for (const coefficient of coefficients) {
        result ^= coefficient;
      }

      return result;
    }

    [result] = coefficients;

    const field = this.#field;
    const { length } = coefficients;

    for (let i = 1; i < length; i++) {
      result = field.multiply(a, result) ^ coefficients[i];
    }

    return result;
  }

  public multiply(scalar: number): Polynomial;
  public multiply(other: Polynomial): Polynomial;
  public multiply(other: number | Polynomial): Polynomial {
    const field = this.#field;
    const coefficients = this.#coefficients;
    const { length } = coefficients;

    if (other instanceof Polynomial) {
      if (this.isZero() || other.isZero()) {
        return field.zero;
      }

      const otherCoefficients = other.#coefficients;
      const otherLength = otherCoefficients.length;
      const product = new Int32Array(length + otherLength - 1);

      for (let i = 0; i < length; i++) {
        const coefficient = coefficients[i];

        for (let j = 0; j < otherLength; j++) {
          product[i + j] ^= field.multiply(coefficient, otherCoefficients[j]);
        }
      }

      return new Polynomial(field, product);
    }

    if (other === 0) {
      return field.zero;
    }

    if (other === 1) {
      return this;
    }

    const product = new Int32Array(length);

    for (let i = 0; i < length; i++) {
      product[i] = field.multiply(coefficients[i], other);
    }

    return new Polynomial(field, product);
  }

  public multiplyByMonomial(degree: number, coefficient: number): Polynomial {
    const field = this.#field;

    if (coefficient === 0) {
      return field.zero;
    }

    const coefficients = this.#coefficients;
    const { length } = coefficients;
    const product = new Int32Array(length + degree);

    for (let i = 0; i < length; i++) {
      product[i] = field.multiply(coefficients[i], coefficient);
    }

    return new Polynomial(field, product);
  }

  public addOrSubtract(other: Polynomial): Polynomial {
    if (this.isZero()) {
      return other;
    }

    if (other.isZero()) {
      return this;
    }

    let largerCoefficients = other.#coefficients;
    let largerLength = largerCoefficients.length;
    let smallerCoefficients = this.#coefficients;
    let smallerLength = smallerCoefficients.length;

    if (largerLength < smallerLength) {
      [largerLength, smallerLength] = [smallerLength, largerLength];
      [largerCoefficients, smallerCoefficients] = [smallerCoefficients, largerCoefficients];
    }

    // Diff index offset.
    const offset = largerLength - smallerLength;
    const coefficients = new Int32Array(largerLength);

    // Copy high-order terms only found in higher-degree polynomial's coefficients.
    coefficients.set(largerCoefficients.subarray(0, offset));

    for (let i = offset; i < largerLength; i++) {
      coefficients[i] = smallerCoefficients[i - offset] ^ largerCoefficients[i];
    }

    return new Polynomial(this.#field, coefficients);
  }

  public divide(other: Polynomial): [quotient: Polynomial, remainder: Polynomial] {
    const field = this.#field;

    let quotient = field.zero;
    let remainder: Polynomial = this;

    const denominatorLeadingTerm = other.getCoefficient(other.getDegree());
    const invertDenominatorLeadingTerm = field.invert(denominatorLeadingTerm);

    while (remainder.getDegree() >= other.getDegree() && !remainder.isZero()) {
      const remainderDegree = remainder.getDegree();
      const degreeDiff = remainderDegree - other.getDegree();
      const scale = field.multiply(remainder.getCoefficient(remainderDegree), invertDenominatorLeadingTerm);
      const term = other.multiplyByMonomial(degreeDiff, scale);
      const iterationQuotient = field.buildPolynomial(degreeDiff, scale);

      quotient = quotient.addOrSubtract(iterationQuotient);
      remainder = remainder.addOrSubtract(term);
    }

    return [quotient, remainder];
  }
}
