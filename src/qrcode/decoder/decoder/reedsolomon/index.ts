/**
 * @module index
 * @author nuintun
 * @author Cosmo Wolfe
 */

import { GenericGFPoly } from './GenericGFPoly';
import { GenericGF, addOrSubtractGF } from './GenericGF';

function runEuclideanAlgorithm(field: GenericGF, a: GenericGFPoly, b: GenericGFPoly, R: number): GenericGFPoly[] {
  // Assume a's degree is >= b's
  if (a.degree() < b.degree()) {
    [a, b] = [b, a];
  }

  let rLast: GenericGFPoly = a;
  let r: GenericGFPoly = b;
  let tLast: GenericGFPoly = field.zero;
  let t: GenericGFPoly = field.one;

  // Run Euclidean algorithm until r's degree is less than R/2
  while (r.degree() >= R / 2) {
    const rLastLast: GenericGFPoly = rLast;
    const tLastLast: GenericGFPoly = tLast;

    rLast = r;
    tLast = t;

    // Divide rLastLast by rLast, with quotient in q and remainder in r
    if (rLast.isZero()) {
      // Euclidean algorithm already terminated?
      return null;
    }

    r = rLastLast;

    let q: GenericGFPoly = field.zero;
    const denominatorLeadingTerm: number = rLast.getCoefficient(rLast.degree());
    const dltInverse: number = field.inverse(denominatorLeadingTerm);

    while (r.degree() >= rLast.degree() && !r.isZero()) {
      const degreeDiff: number = r.degree() - rLast.degree();
      const scale: number = field.multiply(r.getCoefficient(r.degree()), dltInverse);

      q = q.addOrSubtract(field.buildMonomial(degreeDiff, scale));
      r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
    }

    t = q.multiplyPoly(tLast).addOrSubtract(tLastLast);

    if (r.degree() >= rLast.degree()) {
      return null;
    }
  }

  const sigmaTildeAtZero: number = t.getCoefficient(0);

  if (sigmaTildeAtZero === 0) {
    return null;
  }

  const inverse: number = field.inverse(sigmaTildeAtZero);

  return [t.multiply(inverse), r.multiply(inverse)];
}

function findErrorLocations(field: GenericGF, errorLocator: GenericGFPoly): number[] {
  // This is a direct application of Chien's search
  const numErrors: number = errorLocator.degree();

  if (numErrors === 1) {
    return [errorLocator.getCoefficient(1)];
  }

  let errorCount: number = 0;
  const result: number[] = new Array(numErrors);

  for (let i: number = 1; i < field.size && errorCount < numErrors; i++) {
    if (errorLocator.evaluateAt(i) === 0) {
      result[errorCount] = field.inverse(i);
      errorCount++;
    }
  }

  if (errorCount !== numErrors) {
    return null;
  }

  return result;
}

function findErrorMagnitudes(field: GenericGF, errorEvaluator: GenericGFPoly, errorLocations: number[]): number[] {
  // This is directly applying Forney's Formula
  const s: number = errorLocations.length;
  const result: number[] = new Array(s);

  for (let i: number = 0; i < s; i++) {
    let denominator: number = 1;
    const xiInverse: number = field.inverse(errorLocations[i]);

    for (let j: number = 0; j < s; j++) {
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

export function rsDecode(bytes: number[], twoS: number): Uint8ClampedArray {
  const outputBytes: Uint8ClampedArray = new Uint8ClampedArray(bytes.length);

  outputBytes.set(bytes);

  const field: GenericGF = new GenericGF(0x011d, 256, 0); // x^8 + x^4 + x^3 + x^2 + 1
  const poly: GenericGFPoly = new GenericGFPoly(field, outputBytes);
  const syndromeCoefficients: Uint8ClampedArray = new Uint8ClampedArray(twoS);

  let error: boolean = false;

  for (let s: number = 0; s < twoS; s++) {
    const evaluation: number = poly.evaluateAt(field.exp(s + field.generatorBase));

    syndromeCoefficients[syndromeCoefficients.length - 1 - s] = evaluation;

    if (evaluation !== 0) {
      error = true;
    }
  }

  if (!error) {
    return outputBytes;
  }

  const syndrome: GenericGFPoly = new GenericGFPoly(field, syndromeCoefficients);
  const sigmaOmega: GenericGFPoly[] = runEuclideanAlgorithm(field, field.buildMonomial(twoS, 1), syndrome, twoS);

  if (sigmaOmega === null) {
    return null;
  }

  const errorLocations: number[] = findErrorLocations(field, sigmaOmega[0]);

  if (errorLocations == null) {
    return null;
  }

  const errorMagnitudes: number[] = findErrorMagnitudes(field, sigmaOmega[1], errorLocations);

  for (let i: number = 0; i < errorLocations.length; i++) {
    const position: number = outputBytes.length - 1 - field.log(errorLocations[i]);

    if (position < 0) {
      return null;
    }

    outputBytes[position] = addOrSubtractGF(outputBytes[position], errorMagnitudes[i]);
  }

  return outputBytes;
}
