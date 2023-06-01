/**
 * @module ECBlocks
 */

import { ECB } from './ECB';

export class ECBlocks {
  #ecBlocks: ECB[];
  #ecCodewordsPerBlock: number;

  constructor(ecCodewordsPerBlock: number, ...ecBlocks: ECB[]) {
    this.#ecBlocks = ecBlocks;
    this.#ecCodewordsPerBlock = ecCodewordsPerBlock;
  }

  public get ecBlocks(): ECB[] {
    return this.#ecBlocks;
  }

  public get ecCodewordsPerBlock(): number {
    return this.#ecCodewordsPerBlock;
  }

  public getNumBlocks(): number {
    let total = 0;

    const ecBlocks = this.#ecBlocks;

    for (const ecBlock of ecBlocks) {
      total += ecBlock.count;
    }

    return total;
  }

  public getTotalEcCodewords(): number {
    return this.#ecCodewordsPerBlock + this.getNumBlocks();
  }
}
