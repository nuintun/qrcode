/*
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Float from './util/Float';
import MathUtils from './common/detector/MathUtils';

/**
 * <p>Encapsulates a point of interest in an image containing a barcode. Typically, this
 * would be the location of a finder pattern or the corner of the barcode, for example.</p>
 *
 * @author Sean Owen
 */
export default class ResultPoint {
  private x: number;
  private y: number;

  public constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  /**
   * @override
   * @param o
   */
  public equals(o: ResultPoint): boolean {
    return this.x === o.x && this.y === o.y;
  }

  /**
   * @override
   */
  public hashCode(): number {
    return 31 * Float.floatToIntBits(this.x) + Float.floatToIntBits(this.y);
  }

  /**
   * @override
   */
  public toString(): string {
    return '(' + this.x + ',' + this.y + ')';
  }

  /**
   * Orders an array of three ResultPoints in an order [A,B,C] such that AB is less than AC
   * and BC is less than AC, and the angle between BC and BA is less than 180 degrees.
   *
   * @param patterns array of three {@code ResultPoint} to order
   */
  public static orderBestPatterns(patterns: ResultPoint[]): void {
    // Find distances between pattern centers
    const zeroOneDistance: number = this.distance(patterns[0], patterns[1]);
    const oneTwoDistance: number = this.distance(patterns[1], patterns[2]);
    const zeroTwoDistance: number = this.distance(patterns[0], patterns[2]);

    let pointA: ResultPoint;
    let pointB: ResultPoint;
    let pointC: ResultPoint;

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
    if (this.crossProductZ(pointA, pointB, pointC) < 0.0) {
      const temp = pointA;

      pointA = pointC;
      pointC = temp;
    }

    patterns[0] = pointA;
    patterns[1] = pointB;
    patterns[2] = pointC;
  }

  /**
   * @param pattern1 first pattern
   * @param pattern2 second pattern
   * @return distance between two points
   */
  public static distance(pattern1: ResultPoint, pattern2: ResultPoint): number {
    return MathUtils.distance(pattern1.x, pattern1.y, pattern2.x, pattern2.y);
  }

  /**
   * Returns the z component of the cross product between vectors BC and BA.
   */
  private static crossProductZ(pointA: ResultPoint, pointB: ResultPoint, pointC: ResultPoint): number {
    const bX: number = pointB.x;
    const bY: number = pointB.y;

    return (pointC.x - bX) * (pointA.y - bY) - (pointC.y - bY) * (pointA.x - bX);
  }
}
