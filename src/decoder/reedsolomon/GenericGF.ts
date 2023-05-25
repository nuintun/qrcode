/**
 * @module GenericGF
 * @author nuintun
 * @author Cosmo Wolfe
 * @license https://raw.githubusercontent.com/cozmo/jsQR/master/LICENSE
 */

import { GenericGFPoly } from './GenericGFPoly';

export function addOrSubtractGF(a: number, b: number): number {
  return a ^ b;
}

export class GenericGF {
  public primitive: number;
  public size: number;
  public generatorBase: number;
  public zero: GenericGFPoly;
  public one: GenericGFPoly;

  private expTable: number[];
  private logTable: number[];

  constructor(primitive: number, size: number, generatorBase: number) {
    this.primitive = primitive;
    this.size = size;
    this.generatorBase = generatorBase;

    this.expTable = [];
    this.logTable = [];

    let x = 1;

    for (let i = 0; i < this.size; i++) {
      this.logTable[i] = 0;
      this.expTable[i] = x;

      x = x * 2;

      if (x >= this.size) {
        x = (x ^ this.primitive) & (this.size - 1);
      }
    }

    for (let i = 0; i < this.size - 1; i++) {
      this.logTable[this.expTable[i]] = i;
    }

    this.zero = new GenericGFPoly(this, Uint8ClampedArray.from([0]));
    this.one = new GenericGFPoly(this, Uint8ClampedArray.from([1]));
  }

  public multiply(a: number, b: number): number {
    if (a === 0 || b === 0) {
      return 0;
    }

    return this.expTable[(this.logTable[a] + this.logTable[b]) % (this.size - 1)];
  }

  public inverse(a: number): number {
    if (a === 0) {
      throw new Error("can't invert 0");
    }

    return this.expTable[this.size - this.logTable[a] - 1];
  }

  public buildMonomial(degree: number, coefficient: number): GenericGFPoly {
    if (degree < 0) {
      throw new Error('invalid monomial degree less than 0');
    }

    if (coefficient === 0) {
      return this.zero;
    }

    const coefficients = new Uint8ClampedArray(degree + 1);

    coefficients[0] = coefficient;

    return new GenericGFPoly(this, coefficients);
  }

  public log(a: number): number {
    if (a === 0) {
      throw new Error("can't take log(0)");
    }

    return this.logTable[a];
  }

  public exp(a: number): number {
    return this.expTable[a];
  }
}
