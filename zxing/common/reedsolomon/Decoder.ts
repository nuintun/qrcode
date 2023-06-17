/**
 * @module Decoder
 */

import { GenericGFPoly } from './GenericGFPoly';
import { GenericGF, QR_CODE_FIELD_256 } from './GenericGF';

export class Decoder {
  #field: GenericGF;

  constructor(field: GenericGF = QR_CODE_FIELD_256) {
    this.#field = field;
  }

  #findErrorLocations(errorLocator: GenericGFPoly): Int32Array {
    // This is a direct application of Chien's search
    const numErrors = errorLocator.getDegree();

    if (numErrors === 1) {
      // Shortcut
      return new Int32Array([errorLocator.getCoefficient(1)]);
    }

    let e = 0;

    const field = this.#field;
    const { size } = field;
    const result = new Int32Array(numErrors);

    for (let i = 1; i < size && e < numErrors; i++) {
      if (errorLocator.evaluateAt(i) === 0) {
        result[e++] = field.inverse(i);
      }
    }

    if (e !== numErrors) {
      throw new Error('error locator degree does not match number of roots');
    }

    return result;
  }

  #findErrorMagnitudes(errorEvaluator: GenericGFPoly, errorLocations: Int32Array): Int32Array {
    // This is directly applying Forney's Formula
    const field = this.#field;
    const { generator } = field;
    const { length } = errorLocations;
    const result = new Int32Array(length);

    for (let i = 0; i < length; i++) {
      let denominator = 1;

      const xiInverse = field.inverse(errorLocations[i]);

      for (let j = 0; j < length; j++) {
        if (i !== j) {
          // denominator = field.multiply(
          //   denominator,
          //   1 ^ field.multiply(errorLocations[j], xiInverse)
          // )
          // Above should work but fails on some Apple and Linux JDKs due to a Hotspot bug.
          // Below is a funny-looking workaround from Steven Parkes
          const term = field.multiply(errorLocations[j], xiInverse);
          const termPlus1 = (term & 0x1) === 0 ? term | 1 : term & ~1;

          denominator = field.multiply(denominator, termPlus1);
        }
      }

      result[i] = field.multiply(errorEvaluator.evaluateAt(xiInverse), field.inverse(denominator));

      if (generator !== 0) {
        result[i] = field.multiply(result[i], xiInverse);
      }
    }

    return result;
  }

  #runEuclideanAlgorithm(a: GenericGFPoly, b: GenericGFPoly, ecBytes: number): [sigma: GenericGFPoly, omega: GenericGFPoly] {
    // Assume a's degree is >= b's
    if (a.getDegree() < b.getDegree()) {
      [a, b] = [b, a];
    }

    const field = this.#field;

    let remainder = b;
    let term = field.one;
    let remainderLast = a;
    let termLast = field.zero;

    // Run Euclidean algorithm until r's degree is less than ecBytes/2
    while (remainder.getDegree() >= ((ecBytes / 2) | 0)) {
      let termLastLast = termLast;
      let remainderLastLast = remainderLast;

      termLast = term;
      remainderLast = remainder;

      // Divide remainderLastLast by remainderLast, with quotient in q and remainder in r
      if (remainderLast.isZero()) {
        // Oops, Euclidean algorithm already terminated?
        throw new Error('r_{i-1} was zero');
      }

      remainder = remainderLastLast;

      let quotient = field.zero;

      const remainderLastDegree = remainderLast.getDegree();
      const denominatorLeadingTerm = remainderLast.getCoefficient(remainderLastDegree);
      const dltInverse = field.inverse(denominatorLeadingTerm);

      while (remainder.getDegree() >= remainderLastDegree && !remainder.isZero()) {
        const degreeDiff = remainder.getDegree() - remainderLastDegree;
        const scale = field.multiply(remainder.getCoefficient(remainder.getDegree()), dltInverse);

        quotient = quotient.addOrSubtract(field.buildMonomial(degreeDiff, scale));
        remainder = remainder.addOrSubtract(remainderLast.multiplyByMonomial(degreeDiff, scale));
      }

      term = quotient.multiply(termLast).addOrSubtract(termLastLast);

      if (remainder.getDegree() >= remainderLastDegree) {
        throw new Error('division algorithm failed to reduce polynomial');
      }
    }

    const sigmaTildeAtZero = term.getCoefficient(0);

    if (sigmaTildeAtZero === 0) {
      throw new Error('sigma tilde(0) was zero');
    }

    const inverse = field.inverse(sigmaTildeAtZero);
    const sigma = term.multiply(inverse);
    const omega = remainder.multiply(inverse);

    return [sigma, omega];
  }

  public decode(received: Int32Array, ecBytes: number): void {
    const field = this.#field;
    const { generator } = field;
    const poly = new GenericGFPoly(field, received);
    const syndromeCoefficients = new Int32Array(ecBytes);

    let noError: boolean = true;

    for (let i = 0; i < ecBytes; i++) {
      const evalResult = poly.evaluateAt(field.exp(i + generator));

      syndromeCoefficients[ecBytes - 1 - i] = evalResult;

      if (evalResult !== 0) {
        noError = false;
      }
    }

    if (!noError) {
      const syndrome = new GenericGFPoly(field, syndromeCoefficients);
      const [sigma, omega] = this.#runEuclideanAlgorithm(field.buildMonomial(ecBytes, 1), syndrome, ecBytes);
      const errorLocations = this.#findErrorLocations(sigma);
      const errorMagnitudes = this.#findErrorMagnitudes(omega, errorLocations);
      const errorLength = errorLocations.length;
      const receivedLength = received.length;

      for (let i = 0; i < errorLength; i++) {
        const position = receivedLength - 1 - field.log(errorLocations[i]);

        if (position < 0) {
          throw new Error('bad error location');
        }

        received[position] = received[position] ^ errorMagnitudes[i];
      }
    }
  }
}
