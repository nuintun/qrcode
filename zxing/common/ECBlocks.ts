/**
 * @module ECBlocks
 */

import { ECB } from './ECB';

export class ECBlocks {
  #ecBlocks: ECB[];
  #numBlocks: number;
  #numTotalCodewords: number;
  #numTotalECCodewords: number;
  #numTotalDataCodewords: number;
  #numECCodewordsPerBlock: number;

  constructor(numECCodewordsPerBlock: number, ...ecBlocks: ECB[]) {
    let numBlocks = 0;
    let numTotalDataCodewords = 0;

    for (const { count, numDataCodewords } of ecBlocks) {
      numBlocks += count;
      numTotalDataCodewords += numDataCodewords * count;
    }

    const numTotalECCodewords = numECCodewordsPerBlock * numBlocks;

    this.#ecBlocks = ecBlocks;
    this.#numBlocks = numBlocks;
    this.#numTotalECCodewords = numTotalECCodewords;
    this.#numTotalDataCodewords = numTotalDataCodewords;
    this.#numECCodewordsPerBlock = numECCodewordsPerBlock;
    this.#numTotalCodewords = numTotalDataCodewords + numTotalECCodewords;
  }

  public get ecBlocks(): ECB[] {
    return this.#ecBlocks;
  }

  public get numBlocks(): number {
    return this.#numBlocks;
  }

  public get numTotalCodewords(): number {
    return this.#numTotalCodewords;
  }

  public get numTotalECCodewords(): number {
    return this.#numTotalECCodewords;
  }

  public get numTotalDataCodewords(): number {
    return this.#numTotalDataCodewords;
  }

  public get numECCodewordsPerBlock(): number {
    return this.#numECCodewordsPerBlock;
  }
}
