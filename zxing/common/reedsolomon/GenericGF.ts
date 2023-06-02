/**
 * @module GenericGF
 */

import { GenericGFPoly } from './GenericGFPoly';

export class GenericGF {
  #size: number;
  #one: GenericGFPoly;
  #zero: GenericGFPoly;
  #expTable: Int32Array;
  #logTable: Int32Array;
  #generatorBase: number;

  constructor(primitive: number, size: number, generatorBase: number) {
    const expTable = new Int32Array(size);

    let x = 1;

    for (let i = 0; i < size; i++) {
      expTable[i] = x;
      // We're assuming the generator alpha is 2
      x *= 2;

      if (x >= size) {
        x ^= primitive;
        x &= size - 1;
      }
    }

    const logTable = new Int32Array(size);

    for (let i = 0; i < size - 1; i++) {
      logTable[expTable[i]] = i;
    }

    this.#size = size;
    this.#expTable = expTable;
    this.#logTable = logTable;
    this.#generatorBase = generatorBase;
    this.#one = new GenericGFPoly(this, new Int32Array([1]));
    this.#zero = new GenericGFPoly(this, new Int32Array([0]));
  }

  public get size(): number {
    return this.#size;
  }

  public get one(): GenericGFPoly {
    return this.#one;
  }

  public get zero(): GenericGFPoly {
    return this.#zero;
  }

  public get generatorBase(): number {
    return this.#generatorBase;
  }

  public buildMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) {
      throw new Error('illegal monomial degree less than 0');
    }

    if (coefficient === 0) {
      return this.#zero;
    }

    const coefficients = new Int32Array(degree + 1);

    coefficients[0] = coefficient;

    return new GenericGFPoly(this, coefficients);
  }

  public inverse(a: number): number {
    if (a === 0) {
      throw new Error('illegal inverse argument equals 0');
    }

    return this.#expTable[this.#size - this.#logTable[a] - 1];
  }

  public multiply(a: number, b: number): number {
    if (a === 0 || b === 0) {
      return 0;
    }

    const logTable = this.#logTable;

    return this.#expTable[(logTable[a] + logTable[b]) % (this.#size - 1)];
  }

  public log(a: number): number {
    if (a === 0) {
      throw new Error("can't take log(0)");
    }

    return this.#logTable[a];
  }

  public exp(a: number): number {
    return this.#expTable[a];
  }
}

export const QR_CODE_FIELD_256 = new GenericGF(0x011d, 256, 0);
