/**
 * @module FinderPatternGroup
 */

import { Pattern } from './Pattern';
import { distance } from '/common/Point';

function crossProductZ(pattern1: Pattern, pattern2: Pattern, pattern3: Pattern): number {
  const { x, y } = pattern2;

  return (pattern3.x - x) * (pattern1.y - y) - (pattern3.y - y) * (pattern1.x - x);
}

function orderFinderPatterns(patterns: Pattern[]): Pattern[] {
  let topLeft: Pattern;
  let topRight: Pattern;
  let bottomLeft: Pattern;

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
  #patterns: Pattern[];

  constructor(patterns: Pattern[]) {
    this.#patterns = orderFinderPatterns(patterns);
  }

  public get topLeft(): Pattern {
    return this.#patterns[1];
  }

  public get topRight(): Pattern {
    return this.#patterns[2];
  }

  public get bottomLeft(): Pattern {
    return this.#patterns[0];
  }
}
