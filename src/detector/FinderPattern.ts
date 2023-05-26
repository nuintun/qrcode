/**
 * @module FinderPattern
 */

import { ResultPoint } from './ResultPoint';

export class FinderPattern extends ResultPoint {
  public constructor(x: number, y: number, private estimatedModuleSize: number, private count: number = 1) {
    super(x, y);
  }

  public aboutEquals(x: number, y: number, moduleSize: number): boolean {
    if (Math.abs(y - this.y) <= moduleSize && Math.abs(x - this.x) <= moduleSize) {
      const moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);

      return moduleSizeDiff <= 1.0 || moduleSizeDiff <= this.estimatedModuleSize;
    }

    return false;
  }

  public combineEstimate(x: number, y: number, newModuleSize: number): FinderPattern {
    const combinedCount = this.count + 1;
    const combinedX = (this.count * this.x + x) / combinedCount;
    const combinedY = (this.count * this.y + y) / combinedCount;
    const combinedModuleSize = (this.count * this.estimatedModuleSize + newModuleSize) / combinedCount;

    return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}
