/**
 * @module index
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

import { GenericGFPoly } from './GenericGFPoly';
import { addOrSubtractGF, GenericGF } from './GenericGF';

function runEuclideanAlgorithm(field: GenericGF, a: GenericGFPoly, b: GenericGFPoly, R: number): GenericGFPoly[] | never {
  // Assume a's degree is >= b's
  if (a.getDegree() < b.getDegree()) {
    [a, b] = [b, a];
  }

  let r = b;
  let rLast = a;
  let t = field.one;
  let tLast = field.zero;

  // Run Euclidean algorithm until r's degree is less than R/2
  while (r.getDegree() >= R / 2) {
    const rLastLast = rLast;
    const tLastLast = tLast;

    rLast = r;
    tLast = t;

    // Divide rLastLast by rLast, with quotient in q and remainder in r
    if (rLast.isZero()) {
      // Oops, Euclidean algorithm already terminated?
      throw new Error('r_{i-1} was zero');
    }

    r = rLastLast;

    let q = field.zero;

    const denominatorLeadingTerm = rLast.getCoefficient(rLast.getDegree());
    const dltInverse = field.inverse(denominatorLeadingTerm);

    while (r.getDegree() >= rLast.getDegree() && !r.isZero()) {
      const degreeDiff = r.getDegree() - rLast.getDegree();
      const scale = field.multiply(r.getCoefficient(r.getDegree()), dltInverse);

      q = q.addOrSubtract(field.buildMonomial(degreeDiff, scale));
      r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
    }

    t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);

    if (r.getDegree() >= rLast.getDegree()) {
      throw new Error('division algorithm failed to reduce polynomial');
    }
  }

  const sigmaTildeAtZero = t.getCoefficient(0);

  if (sigmaTildeAtZero === 0) {
    throw new Error('sigma tilde[0] was zero');
  }

  const inverse = field.inverse(sigmaTildeAtZero);

  return [t.multiply(inverse), r.multiply(inverse)];
}

function findErrorLocations(field: GenericGF, errorLocator: GenericGFPoly): number[] | never {
  // This is a direct application of Chien's search
  const numErrors = errorLocator.getDegree();

  if (numErrors === 1) {
    return [errorLocator.getCoefficient(1)];
  }

  let errorCount = 0;

  const result: number[] = new Array(numErrors);

  for (let i = 1; i < field.size && errorCount < numErrors; i++) {
    if (errorLocator.evaluateAt(i) === 0) {
      result[errorCount++] = field.inverse(i);
    }
  }

  if (errorCount !== numErrors) {
    throw new Error('error locator degree does not match number of roots');
  }

  return result;
}

function findErrorMagnitudes(field: GenericGF, errorEvaluator: GenericGFPoly, errorLocations: number[]): number[] {
  // This is directly applying Forney's Formula
  const s = errorLocations.length;
  const result: number[] = new Array(s);

  for (let i = 0; i < s; i++) {
    let denominator = 1;
    const xiInverse = field.inverse(errorLocations[i]);

    for (let j = 0; j < s; j++) {
      if (i !== j) {
        denominator = field.multiply(denominator, addOrSubtractGF(1, field.multiply(errorLocations[j], xiInverse)));
      }
    }

    result[i] = field.multiply(errorEvaluator.evaluateAt(xiInverse), field.inverse(denominator));

    if (field.generatorBase !== 0) {
      result[i] = field.multiply(result[i], xiInverse);
    }
  }

  return result;
}

export class Decoder {
  private field = new GenericGF(0x011d, 256, 0);

  public decode(received: number[], twoS: number): Uint8Array | never {
    const { field } = this;
    const bytes = new Uint8Array(received);
    // QR_CODE_FIELD_256
    // x^8 + x^4 + x^3 + x^2 + 1
    const poly = new GenericGFPoly(field, bytes);
    const syndromeCoefficients = new Uint8Array(twoS);

    let noError = true;

    for (let i = 0; i < twoS; i++) {
      const evaluation = poly.evaluateAt(field.exp(i + field.generatorBase));

      syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evaluation;

      if (evaluation !== 0) {
        noError = false;
      }
    }

    if (noError) {
      return bytes;
    }

    const syndrome = new GenericGFPoly(field, syndromeCoefficients);
    const sigmaOmega = runEuclideanAlgorithm(field, field.buildMonomial(twoS, 1), syndrome, twoS);
    const errorLocations = findErrorLocations(field, sigmaOmega[0]);
    const errorMagnitudes = findErrorMagnitudes(field, sigmaOmega[1], errorLocations);

    for (let i = 0; i < errorLocations.length; i++) {
      const position = bytes.length - 1 - field.log(errorLocations[i]);

      if (position < 0) {
        throw new Error('bad error location');
      }

      bytes[position] = addOrSubtractGF(bytes[position], errorMagnitudes[i]);
    }

    return bytes;
  }
}
