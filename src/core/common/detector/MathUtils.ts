/*
 * Copyright 2012 ZXing authors
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

/**
 * General math-related and numeric utility functions.
 */
export default class MathUtils {
  /**
   * Ends up being a bit faster than {@link Math#round(float)}. This merely rounds its
   * argument to the nearest int, where x.5 rounds up to x+1. Semantics of this shortcut
   * differ slightly from {@link Math#round(float)} in that half rounds down for negative
   * values. -2.5 rounds to -3, not -2. For purposes here it makes no difference.
   *
   * @param d real value to round
   * @return nearest {@code int}
   */
  public static round(d: number): number {
    if (isNaN(d)) return 0;

    if (d <= Number.MIN_SAFE_INTEGER) return Number.MIN_SAFE_INTEGER;

    if (d >= Number.MAX_SAFE_INTEGER) return Number.MAX_SAFE_INTEGER;

    return (d + (d < 0.0 ? -0.5 : 0.5)) | 0;
  }

  /**
   * @param aX point A x coordinate
   * @param aY point A y coordinate
   * @param bX point B x coordinate
   * @param bY point B y coordinate
   * @return Euclidean distance between points A and B
   */
  public static distance(aX: number, aY: number, bX: number, bY: number): number {
    const xDiff: number = aX - bX;
    const yDiff: number = aY - bY;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  /**
   * @param array values to sum
   * @return sum of values in array
   */
  public static sum(array: Int32Array): number {
    let count: number = 0;

    for (let i: number = 0, length: number = array.length; i !== length; i++) {
      const a: number = array[i];

      count += a;
    }

    return count;
  }
}
