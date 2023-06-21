/**
 * @module Encoder
 */

import { Polynomial } from './Polynomial';
import { GaloisField, QR_CODE_FIELD_256 } from './GaloisField';

export class Encoder {
  #field: GaloisField;
  #generators: Polynomial[];

  constructor(field: GaloisField = QR_CODE_FIELD_256) {
    this.#field = field;
    this.#generators = [new Polynomial(field, new Int32Array([1]))];
  }

  #buildGenerator(degree: number): Polynomial {
    const generators = this.#generators;
    const { length } = generators;

    if (degree >= length) {
      const field = this.#field;
      const { generator } = field;

      let lastGenerator = generators[length - 1];

      for (let i = length; i <= degree; i++) {
        const coefficients = new Int32Array([1, field.exp(i - 1 + generator)]);
        const nextGenerator = lastGenerator.multiply(new Polynomial(field, coefficients));

        generators.push(nextGenerator);

        lastGenerator = nextGenerator;
      }
    }

    return generators[degree];
  }

  public encode(received: Int32Array, ecLength: number): void {
    const dataBytes = received.length - ecLength;
    const generator = this.#buildGenerator(ecLength);
    const infoCoefficients = new Int32Array(dataBytes);

    infoCoefficients.set(received.subarray(0, dataBytes));

    const base = new Polynomial(this.#field, infoCoefficients);
    const info = base.multiplyByMonomial(ecLength, 1);
    const [, remainder] = info.divide(generator);
    const { coefficients } = remainder;
    const numZeroCoefficients = ecLength - coefficients.length;
    const zeroCoefficientsOffset = dataBytes + numZeroCoefficients;

    received.fill(0, dataBytes, zeroCoefficientsOffset);
    received.set(coefficients, zeroCoefficientsOffset);
  }
}
