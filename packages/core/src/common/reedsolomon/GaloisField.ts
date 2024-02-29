/**
 * @module GaloisField
 */

import { Polynomial } from './Polynomial';

export class GaloisField {
  #size: number;
  #one: Polynomial;
  #zero: Polynomial;
  #generator: number;
  #expTable: Int32Array;
  #logTable: Int32Array;

  constructor(primitive: number, size: number, generator: number) {
    let x = 1;

    const expTable = new Int32Array(size);

    for (let i = 0; i < size; i++) {
      expTable[i] = x;
      // We're assuming the generator alpha is 2.
      x *= 2;

      if (x >= size) {
        x ^= primitive;
        x &= size - 1;
      }
    }

    const logTable = new Int32Array(size);

    for (let i = 0, length = size - 1; i < length; i++) {
      logTable[expTable[i]] = i;
    }

    this.#size = size;
    this.#expTable = expTable;
    this.#logTable = logTable;
    this.#generator = generator;
    this.#one = new Polynomial(this, new Int32Array([1]));
    this.#zero = new Polynomial(this, new Int32Array([0]));
  }

  public get size(): number {
    return this.#size;
  }

  public get one(): Polynomial {
    return this.#one;
  }

  public get zero(): Polynomial {
    return this.#zero;
  }

  public get generator(): number {
    return this.#generator;
  }

  public exp(a: number): number {
    return this.#expTable[a];
  }

  public log(a: number): number {
    return this.#logTable[a];
  }

  public invert(a: number): number {
    return this.#expTable[this.#size - this.#logTable[a] - 1];
  }

  public multiply(a: number, b: number): number {
    if (a === 0 || b === 0) {
      return 0;
    }

    const logTable = this.#logTable;

    return this.#expTable[(logTable[a] + logTable[b]) % (this.#size - 1)];
  }

  public buildPolynomial(degree: number, coefficient: number): Polynomial {
    if (coefficient === 0) {
      return this.#zero;
    }

    const coefficients = new Int32Array(degree + 1);

    coefficients[0] = coefficient;

    return new Polynomial(this, coefficients);
  }
}

export const QR_CODE_FIELD_256 = new GaloisField(0x011d, 256, 0);
