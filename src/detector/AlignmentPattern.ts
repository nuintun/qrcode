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

  public aboutEquals(x: number, y: number, moduleSize: number): boolean {
    if (Math.abs(y - this.y) <= moduleSize && Math.abs(x - this.x) <= moduleSize) {
      const moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);

      return moduleSizeDiff <= 1.0 || moduleSizeDiff <= this.estimatedModuleSize;
    }

    return false;
  }

  public combineEstimate(x: number, y: number, newModuleSize: number): AlignmentPattern {
    const combinedX = (this.x + x) / 2.0;
    const combinedY = (this.y + y) / 2.0;
    const combinedModuleSize = (this.estimatedModuleSize + newModuleSize) / 2.0;

    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}
