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

import ResultPoint from '../../ResultPoint';

/**
 * <p>Encapsulates a finder pattern, which are the three square patterns found in
 * the corners of QR Codes. It also encapsulates a count of similar finder patterns,
 * as a convenience to the finder's bookkeeping.</p>
 *
 * @author Sean Owen
 */
export default class FinderPattern extends ResultPoint {
  private estimatedModuleSize: number;
  private count: number;

  public constructor(posX: number, posY: number, estimatedModuleSize: number, count: number = 1) {
    super(posX, posY);

    this.estimatedModuleSize = estimatedModuleSize;
    this.count = count;
  }

  public getEstimatedModuleSize(): number {
    return this.estimatedModuleSize;
  }

  public getCount(): number {
    return this.count;
  }

  /**
   * <p>Determines if this finder pattern "about equals" a finder pattern at the stated
   * position and size -- meaning, it is at nearly the same center with nearly the same size.</p>
   */
  public aboutEquals(moduleSize: number, i: number, j: number): boolean {
    if (Math.abs(i - this.getY()) <= moduleSize && Math.abs(j - this.getX()) <= moduleSize) {
      const moduleSizeDiff: number = Math.abs(moduleSize - this.estimatedModuleSize);

      return moduleSizeDiff <= 1.0 || moduleSizeDiff <= this.estimatedModuleSize;
    }

    return false;
  }

  /**
   * Combines this object's current estimate of a finder pattern position and module size
   * with a new estimate. It returns a new {@code FinderPattern} containing a weighted average
   * based on count.
   */
  public combineEstimate(i: number, j: number, newModuleSize: number): FinderPattern {
    const combinedCount: number = this.count + 1;
    const combinedX: number = (this.count * this.getX() + j) / combinedCount;
    const combinedY: number = (this.count * this.getY() + i) / combinedCount;
    const combinedModuleSize: number = (this.count * this.estimatedModuleSize + newModuleSize) / combinedCount;

    return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}
