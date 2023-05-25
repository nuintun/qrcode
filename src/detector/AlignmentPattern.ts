/**
 * @module AlignmentPattern
 */

import { ResultPoint } from './ResultPoint';

export class AlignmentPattern extends ResultPoint {
  private estimatedModuleSize: number;

  public constructor(x: number, y: number, estimatedModuleSize: number) {
    super(x, y);

    this.estimatedModuleSize = estimatedModuleSize;
  }

  public aboutEquals(moduleSize: number, i: number, j: number): boolean {
    if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
      const moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);

      return moduleSizeDiff <= 1.0 || moduleSizeDiff <= this.estimatedModuleSize;
    }

    return false;
  }

  public combineEstimate(i: number, j: number, newModuleSize: number): AlignmentPattern {
    const combinedX = (this.x + j) / 2.0;
    const combinedY = (this.y + i) / 2.0;
    const combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2.0;

    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}
