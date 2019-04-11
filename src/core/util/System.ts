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

export default class System {
  /**
   * Makes a copy of a array.
   */
  public static arraycopy(src: any, srcPos: number, dest: any, destPos: number, length: number): void {
    // TODO: better use split or set?
    while (length--) {
      dest[destPos++] = src[srcPos++];
    }
  }

  /**
   * Returns the current time in milliseconds.
   */
  public static currentTimeMillis(): number {
    return Date.now();
  }
}
