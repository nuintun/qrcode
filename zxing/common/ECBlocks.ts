/**
 * @module ECBlocks
 */

import { ECB } from './ECB';

export class ECBlocks {
  #ecBlocks: ECB[];
  #numBlocks: number;
  #totalECCodewords: number;
  #totalDataCodewords: number;
  #ecCodewordsPerBlock: number;

  constructor(ecCodewordsPerBlock: number, ...ecBlocks: ECB[]) {
    let numBlocks = 0;
    let totalDataCodewords = 0;

    for (const { count, dataCodewords } of ecBlocks) {
      numBlocks += count;
      totalDataCodewords += count * dataCodewords;
    }

    this.#ecBlocks = ecBlocks;
    this.#numBlocks = numBlocks;
    this.#totalDataCodewords = totalDataCodewords;
    this.#ecCodewordsPerBlock = ecCodewordsPerBlock;
    this.#totalECCodewords = ecCodewordsPerBlock * numBlocks;
  }

  public get ecBlocks(): ECB[] {
    return this.#ecBlocks;
  }

  public get numBlocks(): number {
    return this.#numBlocks;
  }

  public get totalECCodewords(): number {
    return this.#totalECCodewords;
  }

  public get totalDataCodewords(): number {
    return this.#totalDataCodewords;
  }

  public get ecCodewordsPerBlock(): number {
    return this.#ecCodewordsPerBlock;
  }
}
