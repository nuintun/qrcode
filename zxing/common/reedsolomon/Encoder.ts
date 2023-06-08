/**
 * @module Encoder
 */

import { GenericGFPoly } from './GenericGFPoly';
import { GenericGF, QR_CODE_FIELD_256 } from './GenericGF';

export class Encoder {
  #field: GenericGF;
  #generators: GenericGFPoly[];

  constructor(field: GenericGF = QR_CODE_FIELD_256) {
    this.#field = field;
    this.#generators = [new GenericGFPoly(field, new Int32Array([1]))];
  }

  #buildGenerator(degree: number): GenericGFPoly {
    const generators = this.#generators;
    const { length } = generators;

    if (degree >= length) {
      const field = this.#field;
      const { generatorBase } = field;

      let lastGenerator = generators[length - 1];

      for (let i = length; i <= degree; i++) {
        const coefficients = new Int32Array([1, field.exp(i - 1 + generatorBase)]);
        const nextGenerator = lastGenerator.multiply(new GenericGFPoly(field, coefficients));

        generators.push(nextGenerator);

        lastGenerator = nextGenerator;
      }
    }

    return generators[degree];
  }

  public encode(received: Int32Array, ecBytes: number): void {
    const dataBytes = received.length - ecBytes;
    const generator = this.#buildGenerator(ecBytes);
    const infoCoefficients = new Int32Array(dataBytes);

    infoCoefficients.set(received.subarray(0, dataBytes));

    const base = new GenericGFPoly(this.#field, infoCoefficients);
    const info = base.multiplyByMonomial(ecBytes, 1);
    const [, remainder] = info.divide(generator);
    const { coefficients } = remainder;
    const numZeroCoefficients = ecBytes - coefficients.length;
    const zeroCoefficientsOffset = dataBytes + numZeroCoefficients;

    received.fill(0, dataBytes, zeroCoefficientsOffset);
    received.set(coefficients, zeroCoefficientsOffset);
  }
}
