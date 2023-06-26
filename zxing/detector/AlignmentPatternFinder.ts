/**
 * @module AlignmentPatternFinder
 */

import { BitMatrix } from '/common/BitMatrix';
import { AlignmentPattern } from './AlignmentPattern';

function centerFromEnd(stateCount: number[], end: number): number {
  return end - stateCount[2] - Math.floor(stateCount[1] / 2);
}

export class AlignmentPatternFinder {
  #x: number;
  #y: number;
  #matrix: BitMatrix;
  #moduleSize: number;
  #crossCheckStateCount: number = 0;
  #patterns: AlignmentPattern[] = [];

  constructor(matrix: BitMatrix, x: number, y: number, moduleSize: number) {
    this.#x = x;
    this.#y = y;
    this.#matrix = matrix;
    this.#moduleSize = moduleSize;

    console.log(this.#crossCheckVertical, centerFromEnd);
  }

  #foundPatternCross(stateCount: number[]): boolean {
    const moduleSize = this.#moduleSize;
    const maxVariance = Math.floor(moduleSize / 2);

    for (let i = 0; i < 3; i++) {
      if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
        return false;
      }
    }

    return true;
  }

  #crossCheckVertical(x: number, y: number, maxCount: number, originalStateCountTotal: number) {
    const matrix = this.#matrix;
    const size = matrix.size;

    console.log(size, this.#x, this.#y, this.#patterns, this.#foundPatternCross);
    console.log(x, y, maxCount, originalStateCountTotal, this.#crossCheckStateCount);
  }
}
