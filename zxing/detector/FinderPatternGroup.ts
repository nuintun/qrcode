/**
 * @module FinderPatternGroup
 */

import { distance } from '/common/Point';
import { FinderPattern } from './FinderPattern';

function crossProductZ(pattern1: FinderPattern, pattern2: FinderPattern, pattern3: FinderPattern): number {
  const { x, y } = pattern2;

  return (pattern3.x - x) * (pattern1.y - y) - (pattern3.y - y) * (pattern1.x - x);
}

function orderFinderPatterns(patterns: FinderPattern[]): FinderPattern[] {
  let topLeft: FinderPattern;
  let topRight: FinderPattern;
  let bottomLeft: FinderPattern;

  // Find distances between pattern centers
  const [pattern1, pattern2, pattern3] = patterns;
  const oneTwoDistance = distance(pattern1, pattern2);
  const twoThreeDistance = distance(pattern2, pattern3);
  const oneThreeDistance = distance(pattern1, pattern3);

  // Assume one closest to other two is B; A and C will just be guesses at first
  if (twoThreeDistance >= oneTwoDistance && twoThreeDistance >= oneThreeDistance) {
    [topLeft, bottomLeft, topRight] = patterns;
  } else if (oneThreeDistance >= twoThreeDistance && oneThreeDistance >= oneTwoDistance) {
    [bottomLeft, topLeft, topRight] = patterns;
  } else {
    [bottomLeft, topRight, topLeft] = patterns;
  }

  // Use cross product to figure out whether A and C are correct or flipped.
  // This asks whether BC x BA has a positive z component, which is the arrangement
  // we want for A, B, C. If it's negative, then we've got it flipped around and
  // should swap A and C.
  if (crossProductZ(bottomLeft, topLeft, topRight) < 0) {
    [bottomLeft, topRight] = [topRight, bottomLeft];
  }

  return [bottomLeft, topLeft, topRight];
}

export class FinderPatternGroup {
  #patterns: FinderPattern[];

  constructor(patterns: FinderPattern[]) {
    this.#patterns = orderFinderPatterns(patterns);
  }

  public get topLeft(): FinderPattern {
    return this.#patterns[1];
  }

  public get topRight(): FinderPattern {
    return this.#patterns[2];
  }

  public get bottomLeft(): FinderPattern {
    return this.#patterns[0];
  }
}
