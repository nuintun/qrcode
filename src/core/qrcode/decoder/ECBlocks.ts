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

import ECB from './ECB';

/**
 * <p>Encapsulates a set of error-correction blocks in one symbol version. Most versions will
 * use blocks of differing sizes within one version, so, this encapsulates the parameters for
 * each set of blocks. It also holds the number of error-correction codewords per block since it
 * will be the same across all blocks within one version.</p>
 */
export default class ECBlocks {
  private ecBlocks: ECB[];

  /**
   * @constructor
   * @param ecCodewordsPerBlock
   * @param ecBlocks
   */
  public constructor(private ecCodewordsPerBlock: number, ...ecBlocks: ECB[]) {
    this.ecBlocks = ecBlocks;
  }

  public getECCodewordsPerBlock(): number {
    return this.ecCodewordsPerBlock;
  }

  public getNumBlocks(): number {
    let total: number = 0;
    const ecBlocks: ECB[] = this.ecBlocks;

    for (const ecBlock of ecBlocks) {
      total += ecBlock.getCount();
    }

    return total;
  }

  public getTotalECCodewords(): number {
    return this.ecCodewordsPerBlock * this.getNumBlocks();
  }

  public getECBlocks(): ECB[] {
    return this.ecBlocks;
  }
}
