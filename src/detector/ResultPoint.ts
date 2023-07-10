/**
 * @module ResultPoint
 */

function distance(aX: number, aY: number, bX: number, bY: number): number {
  const xDiff = aX - bX;
  const yDiff = aY - bY;

  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

function distancePoint(pattern1: ResultPoint, pattern2: ResultPoint): number {
  return distance(pattern1.x, pattern1.y, pattern2.x, pattern2.y);
}

function crossProductZ(pointA: ResultPoint, pointB: ResultPoint, pointC: ResultPoint): number {
  const bX = pointB.x;
  const bY = pointB.y;

  return (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX);
}

export class ResultPoint {
  public constructor(
    public x: number,
    public y: number
  ) {
    // ResultPoint constructor
  }
}

export interface ResultPointCallback {
  foundPossibleResultPoint(point: ResultPoint): void;
}

export function orderBestPatterns(patterns: ResultPoint[]): void {
  let pointA: ResultPoint;
  let pointB: ResultPoint;
  let pointC: ResultPoint;

  // Find distances between pattern centers
  const zeroOneDistance = distancePoint(patterns[0], patterns[1]);
  const oneTwoDistance = distancePoint(patterns[1], patterns[2]);
  const zeroTwoDistance = distancePoint(patterns[0], patterns[2]);

  // Assume one closest to other two is B; A and C will just be guesses at first
  if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
    pointB = patterns[0];
    pointA = patterns[1];
    pointC = patterns[2];
  } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
    pointB = patterns[1];
    pointA = patterns[0];
    pointC = patterns[2];
  } else {
    pointB = patterns[2];
    pointA = patterns[0];
    pointC = patterns[1];
  }

  // Use cross product to figure out whether A and C are correct or flipped.
  // This asks whether BC x BA has a positive z component, which is the arrangement
  // we want for A, B, C. If it's negative, then we've got it flipped around and
  // should swap A and C.
  if (crossProductZ(pointA, pointB, pointC) < 0.0) {
    const temp = pointA;
    pointA = pointC;
    pointC = temp;
  }

  patterns[0] = pointA;
  patterns[1] = pointB;
  patterns[2] = pointC;
}
