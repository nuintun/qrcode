/*
 * Copyright 2008 ZXing authors
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

import System from './System';

export default class Arrays {
  public static equals(first: any, second: any): boolean {
    if (!first) {
      return false;
    }

    if (!second) {
      return false;
    }

    if (!first.length) {
      return false;
    }

    if (!second.length) {
      return false;
    }

    if (first.length !== second.length) {
      return false;
    }

    for (let i: number = 0, length = first.length; i < length; i++) {
      if (first[i] !== second[i]) {
        return false;
      }
    }

    return true;
  }

  public static hashCode(a: any) {
    if (a == null) {
      return 0;
    }

    let result = 1;

    for (const element of a) {
      result = 31 * result + element;
    }

    return result;
  }

  public static fillUint8Array(a: Uint8Array, value: number) {
    for (let i: number = 0; i !== a.length; i++) {
      a[i] = value;
    }
  }

  public static copyOf(original: Int32Array, newLength: number) {
    const copy: Int32Array = new Int32Array(newLength);

    System.arraycopy(original, 0, copy, 0, Math.min(original.length, newLength));

    return copy;
  }

  /*
   * Returns the index of of the element in a sorted array or (-n-1) where n is the insertion point
   * for the new element.
   * Parameters:
   *     ar - A sorted array
   *     el - An element to search for
   *     comparator - A comparator function. The function takes two arguments: (a, b) and returns:
   *        a negative number  if a is less than b;
   *        0 if a is equal to b;
   *        a positive number of a is greater than b.
   * The array may contain duplicate elements. If there are more than one equal elements in the array,
   * the returned value can be the index of any one of the equal elements.
   *
   * http://jsfiddle.net/aryzhov/pkfst550/
   */
  public static binarySearch(ar: Int32Array, el: number, comparator?: (a: number, b: number) => number): number {
    if (comparator == null) {
      comparator = Arrays.numberComparator;
    }

    let m: number = 0;
    let n: number = ar.length - 1;

    while (m <= n) {
      const k: number = (n + m) >> 1;
      const cmp: number = comparator(el, ar[k]);

      if (cmp > 0) {
        m = k + 1;
      } else if (cmp < 0) {
        n = k - 1;
      } else {
        return k;
      }
    }

    return -m - 1;
  }

  public static numberComparator(a: number, b: number) {
    return a - b;
  }
}
