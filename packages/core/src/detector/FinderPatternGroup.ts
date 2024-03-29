/**
 * @module FinderPatternGroup
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { accumulate, round } from '/common/utils';
import { MAX_VERSION_SIZE } from '/common/Version';
import { calculateModuleSizeOneWay, ModuleSizeGroup } from './utils/module';
import { calculateTriangleArea, distance, Point, squaredDistance } from '/common/Point';

type OrderedPatterns = [
  // Top left finder.
  topLeft: Pattern,
  // Top right finder.
  topRight: Pattern,
  // Bottom left finder.
  bottomLeft: Pattern
];

function calculateSizeRatio(size1: number, size2: number): number {
  return size1 > size2 ? size1 / size2 : size2 / size1;
}

function calculateDistanceRatio(pattern1: Pattern, pattern2: Pattern): number {
  const ratio = Math.max(
    calculateSizeRatio(Pattern.width(pattern1), Pattern.width(pattern2)),
    calculateSizeRatio(Pattern.height(pattern1), Pattern.height(pattern2))
  );

  return ratio * ratio;
}

function crossProductZ(pattern1: Pattern, pattern2: Pattern, pattern3: Pattern): number {
  const { x, y } = pattern2;

  return (pattern3.x - x) * (pattern1.y - y) - (pattern3.y - y) * (pattern1.x - x);
}

function orderFinderPatterns(patterns: Pattern[]): OrderedPatterns {
  let topLeft: Pattern;
  let topRight: Pattern;
  let bottomLeft: Pattern;

  // Find distances between pattern centers.
  const [pattern1, pattern2, pattern3] = patterns;
  // @see https://github.com/zxing-cpp/zxing-cpp/blob/master/core/src/qrcode/QRDetector.cpp
  const oneTwoDistance = squaredDistance(pattern1, pattern2) * calculateDistanceRatio(pattern1, pattern2);
  const oneThreeDistance = squaredDistance(pattern1, pattern3) * calculateDistanceRatio(pattern1, pattern3);
  const twoThreeDistance = squaredDistance(pattern2, pattern3) * calculateDistanceRatio(pattern2, pattern3);

  // Assume one closest to other two is B; A and C will just be guesses at first.
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

  return [topLeft, topRight, bottomLeft];
}

function calculateBottomRightPoint([topLeft, topRight, bottomLeft]: OrderedPatterns): Point {
  const { x, y } = topLeft;
  const bottomRightX = topRight.x + bottomLeft.x - x;
  const bottomRightY = topRight.y + bottomLeft.y - y;

  return new Point(bottomRightX, bottomRightY);
}

function calculateSymbolSize([topLeft, topRight, bottomLeft]: OrderedPatterns, moduleSize: number): number {
  const width = distance(topLeft, topRight);
  const height = distance(topLeft, bottomLeft);
  const size = round((width + height) / moduleSize / 2) + 7;

  switch (size & 0x03) {
    case 0:
      return size + 1;
    case 2:
      return size - 1;
    case 3:
      return Math.min(size + 2, MAX_VERSION_SIZE);
  }

  return size;
}

export class FinderPatternGroup {
  #area?: number;
  #size?: number;
  #matrix: BitMatrix;
  #bottomRight?: Point;
  #moduleSize?: number;
  #patterns: OrderedPatterns;
  #moduleSizes?: ModuleSizeGroup;

  public static moduleSizes(finderPatternGroup: FinderPatternGroup): ModuleSizeGroup {
    if (finderPatternGroup.#moduleSizes == null) {
      const matrix = finderPatternGroup.#matrix;
      const [topLeft, topRight, bottomLeft] = finderPatternGroup.#patterns;

      finderPatternGroup.#moduleSizes = [
        calculateModuleSizeOneWay(matrix, topLeft, topRight),
        calculateModuleSizeOneWay(matrix, topLeft, bottomLeft)
      ];
    }

    return finderPatternGroup.#moduleSizes;
  }

  public static size(finderPatternGroup: FinderPatternGroup): number {
    if (finderPatternGroup.#size == null) {
      const moduleSize = FinderPatternGroup.moduleSize(finderPatternGroup);

      finderPatternGroup.#size = calculateSymbolSize(finderPatternGroup.#patterns, moduleSize);
    }

    return finderPatternGroup.#size;
  }

  public static moduleSize(finderPatternGroup: FinderPatternGroup): number {
    if (finderPatternGroup.#moduleSize == null) {
      finderPatternGroup.#moduleSize = accumulate(FinderPatternGroup.moduleSizes(finderPatternGroup)) / 2;
    }

    return finderPatternGroup.#moduleSize;
  }

  public static contains(finderPatternGroup: FinderPatternGroup, pattern: Pattern): boolean {
    const area = finderPatternGroup.#calculateArea();
    const [topLeft, topRight, bottomLeft] = finderPatternGroup.#patterns;
    const bottomRight = FinderPatternGroup.bottomRight(finderPatternGroup);
    const s1 = calculateTriangleArea(topLeft, topRight, pattern);
    const s2 = calculateTriangleArea(topRight, bottomRight, pattern);
    const s3 = calculateTriangleArea(bottomRight, bottomLeft, pattern);
    const s4 = calculateTriangleArea(bottomLeft, topLeft, pattern);

    // Pattern not a point, increase the detection margin appropriately.
    return s1 + s2 + s3 + s4 - area < 1;
  }

  public static bottomRight(finderPatternGroup: FinderPatternGroup): Point {
    if (finderPatternGroup.#bottomRight == null) {
      finderPatternGroup.#bottomRight = calculateBottomRightPoint(finderPatternGroup.#patterns);
    }

    return finderPatternGroup.#bottomRight;
  }

  constructor(matrix: BitMatrix, patterns: Pattern[]) {
    this.#matrix = matrix;
    this.#patterns = orderFinderPatterns(patterns);
  }

  public get topLeft(): Pattern {
    return this.#patterns[0];
  }

  public get topRight(): Pattern {
    return this.#patterns[1];
  }

  public get bottomLeft(): Pattern {
    return this.#patterns[2];
  }

  #calculateArea(): number {
    const [topLeft, topRight, bottomLeft] = this.#patterns;
    const bottomRight = FinderPatternGroup.bottomRight(this);

    if (this.#area == null) {
      const s1 = calculateTriangleArea(topLeft, topRight, bottomRight);
      const s2 = calculateTriangleArea(bottomRight, bottomLeft, topLeft);

      this.#area = s1 + s2;
    }

    return this.#area;
  }
}

export function calculateTopLeftAngle({ topLeft, topRight, bottomLeft }: FinderPatternGroup): number {
  const { x, y } = topLeft;
  const dx1 = topRight.x - x;
  const dy1 = topRight.y - y;
  const dx2 = bottomLeft.x - x;
  const dy2 = bottomLeft.y - y;
  const d = dx1 * dx2 + dy1 * dy2;
  const l2 = (dx1 * dx1 + dy1 * dy1) * (dx2 * dx2 + dy2 * dy2);

  return Math.acos(d / Math.sqrt(l2));
}
