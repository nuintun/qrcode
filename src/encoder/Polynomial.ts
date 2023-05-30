/**
 * @module Polynomial
 * @author nuintun
 * @author Kazuhiko Arase
 */

import { gexp, glog } from './math';

export class Polynomial {
  private factors: number[];

  public constructor(numbers: number[], shift: number = 0) {
    let offset = 0;
    let { length } = numbers;

    while (offset < length && numbers[offset] === 0) {
      offset++;
    }

    length -= offset;

    const factors: number[] = [];

    for (let i = 0; i < length; i++) {
      factors.push(numbers[offset + i]);
    }

    for (let i = 0; i < shift; i++) {
      factors.push(0);
    }

    this.factors = factors;
  }

  public get length(): number {
    return this.factors.length;
  }

  public at(index: number): number {
    const { factors } = this;

    return factors[index < 0 ? factors.length + index : index];
  }

  public multiply(e: Polynomial): Polynomial {
    const eLength = e.length;
    const tLength = this.length;
    const numbers: number[] = [];
    const dLength = tLength + eLength - 1;

    for (let i = 0; i < dLength; i++) {
      numbers.push(0);
    }

    for (let i = 0; i < tLength; i++) {
      for (let j = 0; j < eLength; j++) {
        numbers[i + j] ^= gexp(glog(this.at(i)) + glog(e.at(j)));
      }
    }

    return new Polynomial(numbers);
  }

  public mod(e: Polynomial): Polynomial {
    const eLength = e.length;
    const tLength = this.length;

    if (tLength - eLength < 0) {
      return this;
    }

    const ratio = glog(this.at(0)) - glog(e.at(0));

    // Create copy
    const numbers: number[] = [];

    for (let i = 0; i < tLength; i++) {
      numbers.push(this.at(i));
    }

    // Subtract and calc rest.
    for (let i = 0; i < eLength; i++) {
      numbers[i] ^= gexp(glog(e.at(i)) + ratio);
    }

    // Call recursively
    return new Polynomial(numbers).mod(e);
  }
}
