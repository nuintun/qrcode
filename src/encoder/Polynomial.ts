/**
 * @module Polynomial
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as QRMath from './QRMath';

export class Polynomial {
  private num: number[];

  public constructor(num: number[], shift: number = 0) {
    let offset = 0;
    let { length } = num;

    while (offset < length && num[offset] === 0) {
      offset++;
    }

    length -= offset;

    const numbers: number[] = [];

    for (let i = 0; i < length; i++) {
      numbers.push(num[offset + i]);
    }

    for (let i = 0; i < shift; i++) {
      numbers.push(0);
    }

    this.num = numbers;
  }

  public getAt(index: number): number {
    return this.num[index];
  }

  public getLength(): number {
    return this.num.length;
  }

  public multiply(e: Polynomial): Polynomial {
    const num: number[] = [];
    const eLength = e.getLength();
    const tLength = this.getLength();
    const dLength = tLength + eLength - 1;

    for (let i = 0; i < dLength; i++) {
      num.push(0);
    }

    for (let i = 0; i < tLength; i++) {
      for (let j = 0; j < eLength; j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }

    return new Polynomial(num);
  }

  public mod(e: Polynomial): Polynomial {
    const eLength = e.getLength();
    const tLength = this.getLength();

    if (tLength - eLength < 0) {
      return this;
    }

    const ratio = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));

    // Create copy
    const num: number[] = [];

    for (let i = 0; i < tLength; i++) {
      num.push(this.getAt(i));
    }

    // Subtract and calc rest.
    for (let i = 0; i < eLength; i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    }

    // Call recursively
    return new Polynomial(num).mod(e);
  }
}
