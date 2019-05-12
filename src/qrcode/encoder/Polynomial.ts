/**
 * @module Polynomial
 * @author nuintun
 * @author Kazuhiko Arase
 */

import * as QRMath from './QRMath';

export class Polynomial {
  private num: number[];

  public constructor(num: number[], shift: number = 0) {
    this.num = [];

    let offset: number = 0;
    let length: number = num.length;

    while (offset < length && num[offset] === 0) {
      offset++;
    }

    length -= offset;

    for (let i: number = 0; i < length; i++) {
      this.num.push(num[offset + i]);
    }

    for (let i: number = 0; i < shift; i++) {
      this.num.push(0);
    }
  }

  public getAt(index: number): number {
    return this.num[index];
  }

  public getLength(): number {
    return this.num.length;
  }

  public multiply(e: Polynomial): Polynomial {
    const num: number[] = [];
    const eLength: number = e.getLength();
    const tLength: number = this.getLength();
    const dLength: number = tLength + eLength - 1;

    for (let i: number = 0; i < dLength; i++) {
      num.push(0);
    }

    for (let i: number = 0; i < tLength; i++) {
      for (let j: number = 0; j < eLength; j++) {
        num[i + j] ^= QRMath.gexp(QRMath.glog(this.getAt(i)) + QRMath.glog(e.getAt(j)));
      }
    }

    return new Polynomial(num);
  }

  public mod(e: Polynomial): Polynomial {
    const eLength: number = e.getLength();
    const tLength: number = this.getLength();

    if (tLength - eLength < 0) {
      return this;
    }

    const ratio: number = QRMath.glog(this.getAt(0)) - QRMath.glog(e.getAt(0));

    // Create copy
    const num: number[] = [];

    for (let i: number = 0; i < tLength; i++) {
      num.push(this.getAt(i));
    }

    // Subtract and calc rest.
    for (let i: number = 0; i < eLength; i++) {
      num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i)) + ratio);
    }

    // Call recursively
    return new Polynomial(num).mod(e);
  }
}
