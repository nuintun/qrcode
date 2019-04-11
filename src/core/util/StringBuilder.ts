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

export default class StringBuilder {
  private value: string = '';

  public append(s: string | number): StringBuilder {
    if (typeof s === 'string') {
      this.value += s.toString();
    } else {
      this.value += String.fromCharCode(s);
    }

    return this;
  }

  public length(): number {
    return this.value.length;
  }

  public charAt(n: number): string {
    return this.value.charAt(n);
  }

  public deleteCharAt(n: number) {
    this.value = this.value.substr(0, n) + this.value.substring(n + 1);
  }

  public setCharAt(n: number, c: string) {
    this.value = this.value.substr(0, n) + c + this.value.substr(n + 1);
  }

  public toString(): string {
    return this.value;
  }

  public insert(n: number, c: string) {
    this.value = this.value.substr(0, n) + c + this.value.substr(n + c.length);
  }
}
