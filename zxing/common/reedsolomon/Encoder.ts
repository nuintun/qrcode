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

    if (degree >= generators.length) {
      const field = this.#field;
      const { length } = generators;
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
    if (ecBytes === 0) {
      throw new Error('no error correction bytes');
    }

    const dataBytes = received.length - ecBytes;

    if (dataBytes <= 0) {
      throw new Error('no data bytes provided');
    }

    const generator = this.#buildGenerator(ecBytes);
    const infoCoefficients = new Int32Array(dataBytes);

    infoCoefficients.set(received.subarray(0, dataBytes));

    const base = new GenericGFPoly(this.#field, infoCoefficients);
    const info = base.multiplyByMonomial(ecBytes, 1);
    const [, remainder] = info.divide(generator);
    const { coefficients } = remainder;
    const numZeroCoefficients = ecBytes - coefficients.length;

    for (let i = 0; i < numZeroCoefficients; i++) {
      received[dataBytes + i] = 0;
    }

    received.set(coefficients, dataBytes + numZeroCoefficients);
  }
}
