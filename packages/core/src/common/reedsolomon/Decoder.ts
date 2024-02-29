/**
 * @module Decoder
 */

import { Polynomial } from './Polynomial';
import { GaloisField, QR_CODE_FIELD_256 } from './GaloisField';

function runEuclideanAlgorithm(
  field: GaloisField,
  a: Polynomial,
  b: Polynomial,
  ecLength: number
): [sigma: Polynomial, omega: Polynomial] {
  // Assume a's degree is >= b's.
  if (a.getDegree() < b.getDegree()) {
    [a, b] = [b, a];
  }

  let remainder = b;
  let term = field.one;
  let remainderLast = a;
  let termLast = field.zero;

  // Run Euclidean algorithm until r's degree is less than ecLength/2.
  while (2 * remainder.getDegree() >= ecLength) {
    let termLastLast = termLast;
    let remainderLastLast = remainderLast;

    termLast = term;
    remainderLast = remainder;

    // Divide remainder last last by remainder last, with quotient in quotient and remainder in remainder.
    if (remainderLast.isZero()) {
      // Oops, euclidean algorithm already terminated?
      throw new Error('remainder last was zero');
    }

    remainder = remainderLastLast;

    let quotient = field.zero;
    let remainderDegree = remainder.getDegree();

    const remainderLastDegree = remainderLast.getDegree();
    const denominatorLeadingTerm = remainderLast.getCoefficient(remainderLastDegree);
    const dltInverse = field.invert(denominatorLeadingTerm);

    while (remainderDegree >= remainderLastDegree && !remainder.isZero()) {
      const degreeDiff = remainder.getDegree() - remainderLastDegree;
      const scale = field.multiply(remainder.getCoefficient(remainderDegree), dltInverse);

      quotient = quotient.addOrSubtract(field.buildPolynomial(degreeDiff, scale));
      remainder = remainder.addOrSubtract(remainderLast.multiplyByMonomial(degreeDiff, scale));
      remainderDegree = remainder.getDegree();
    }

    term = quotient.multiply(termLast).addOrSubtract(termLastLast);

    if (remainderDegree >= remainderLastDegree) {
      throw new Error('division algorithm failed to reduce polynomial');
    }
  }

  const sigmaTildeAtZero = term.getCoefficient(0);

  if (sigmaTildeAtZero === 0) {
    throw new Error('sigma tilde(0) was zero');
  }

  const invert = field.invert(sigmaTildeAtZero);
  const sigma = term.multiply(invert);
  const omega = remainder.multiply(invert);

  return [sigma, omega];
}

function findErrorLocations(field: GaloisField, errorLocator: Polynomial): Int32Array {
  // This is a direct application of Chien's search.
  const numErrors = errorLocator.getDegree();

  if (numErrors === 1) {
    // Shortcut
    return new Int32Array([errorLocator.getCoefficient(1)]);
  }

  let e = 0;

  const { size } = field;
  const result = new Int32Array(numErrors);

  for (let i = 1; i < size && e < numErrors; i++) {
    if (errorLocator.evaluate(i) === 0) {
      result[e++] = field.invert(i);
    }
  }

  if (e !== numErrors) {
    throw new Error('error locator degree does not match number of roots');
  }

  return result;
}

function findErrorMagnitudes(field: GaloisField, errorEvaluator: Polynomial, errorLocations: Int32Array): Int32Array {
  // This is directly applying Forney's Formula.
  const { length } = errorLocations;
  const result = new Int32Array(length);

  for (let i = 0; i < length; i++) {
    let denominator = 1;

    const invert = field.invert(errorLocations[i]);

    for (let j = 0; j < length; j++) {
      if (i !== j) {
        // denominator = field.multiply(
        //   denominator,
        //   1 ^ field.multiply(errorLocations[j], invert)
        // )
        // Above should work but fails on some Apple and Linux JDKs due to a Hotspot bug.
        // Below is a funny-looking workaround from Steven Parkes.
        const term = field.multiply(errorLocations[j], invert);
        const termPlus1 = (term & 0x01) === 0 ? term | 1 : term & ~1;

        denominator = field.multiply(denominator, termPlus1);
      }
    }

    result[i] = field.multiply(errorEvaluator.evaluate(invert), field.invert(denominator));

    if (field.generator !== 0) {
      result[i] = field.multiply(result[i], invert);
    }
  }

  return result;
}

export class Decoder {
  #field: GaloisField;

  constructor(field: GaloisField = QR_CODE_FIELD_256) {
    this.#field = field;
  }

  public decode(received: Int32Array, ecLength: number): number {
    let noError = true;

    const field = this.#field;
    const { generator } = field;
    const poly = new Polynomial(field, received);
    const syndromeCoefficients = new Int32Array(ecLength);

    for (let i = 0; i < ecLength; i++) {
      const evaluate = poly.evaluate(field.exp(i + generator));

      syndromeCoefficients[ecLength - 1 - i] = evaluate;

      if (evaluate !== 0) {
        noError = false;
      }
    }

    if (!noError) {
      const syndrome = new Polynomial(field, syndromeCoefficients);
      const [sigma, omega] = runEuclideanAlgorithm(field, field.buildPolynomial(ecLength, 1), syndrome, ecLength);
      const errorLocations = findErrorLocations(field, sigma);
      const errorMagnitudes = findErrorMagnitudes(field, omega, errorLocations);
      const errorLength = errorLocations.length;
      const receivedLength = received.length;

      for (let i = 0; i < errorLength; i++) {
        const position = receivedLength - 1 - field.log(errorLocations[i]);

        if (position < 0) {
          throw new Error('bad error location');
        }

        received[position] = received[position] ^ errorMagnitudes[i];
      }

      return errorLength;
    }

    return 0;
  }
}
