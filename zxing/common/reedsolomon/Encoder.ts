/**
 * @module Encoder
 */

import { GenericGFPoly } from './GenericGFPoly';
import { GenericGF, QR_CODE_FIELD_256 } from './GenericGF';

export class Encoder {
  #cachedGenerators: GenericGFPoly[];
  #field: GenericGF = QR_CODE_FIELD_256;

  constructor() {
    this.#cachedGenerators = [new GenericGFPoly(this.#field, new Int32Array([1]))];
  }

  #buildGenerator(degree: number): GenericGFPoly {
    const cachedGenerators = this.#cachedGenerators;
    const { length } = cachedGenerators;

    if (degree >= length) {
      const field = this.#field;

      let lastGenerator = cachedGenerators[length - 1];

      for (let i = length; i <= degree; i++) {
        const nextGenerator = lastGenerator.multiply(
          new GenericGFPoly(field, Int32Array.from([1, field.exp(i - 1 + field.generatorBase)]))
        );

        cachedGenerators.push(nextGenerator);

        lastGenerator = nextGenerator;
      }
    }

    return cachedGenerators[degree];
  }

  public encode(received: Int32Array, ecBytes: number): void {
    if (ecBytes === 0) {
      throw new Error('No error correction bytes');
    }

    const dataBytes = received.length - ecBytes;

    if (dataBytes <= 0) {
      throw new Error('No data bytes provided');
    }

    const generator = this.#buildGenerator(ecBytes);
    const infoCoefficients: Int32Array = new Int32Array(dataBytes);

    infoCoefficients.set(received.subarray(0, dataBytes));

    let info = new GenericGFPoly(this.#field, infoCoefficients);

    info = info.multiplyByMonomial(ecBytes, 1);

    const remainder = info.divide(generator)[1];
    const coefficients = remainder.coefficients;
    const numZeroCoefficients = ecBytes - coefficients.length;

    for (let i = 0; i < numZeroCoefficients; i++) {
      received[dataBytes + i] = 0;
    }

    received.set(coefficients, dataBytes + numZeroCoefficients);
  }
}
