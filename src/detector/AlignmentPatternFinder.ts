/**
 * @module AlignmentPatternFinder
 */

// import { BitMatrix } from '/decoder/BitMatrix';
// import { ResultPointCallback } from './ResultPoint';
// import { AlignmentPattern } from './AlignmentPattern';

// export class AlignmentPatternFinder {
//   private crossCheckStateCount: number[];
//   private possibleCenters: AlignmentPattern[];

//   public constructor(
//     private image: BitMatrix,
//     private startX: number,
//     private startY: number,
//     private width: number,
//     private height: number,
//     private moduleSize: number,
//     private resultPointCallback: ResultPointCallback
//   ) {
//     this.possibleCenters = [];
//     this.crossCheckStateCount = [0, 0, 0];
//   }

//   public find(): AlignmentPattern {
//     const { image, width, height, startX } = this;

//     const maxJ = startX + width;
//     const middleI = this.startY + height / 2;

//     // We are looking for black/white/black modules in 1:1:1 ratio
//     // this tracks the number of black/white/black modules seen so far
//     const stateCount = [0, 0, 0];
//   }
// }
