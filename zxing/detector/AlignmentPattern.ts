/**
 * @module AlignmentPattern
 */

import { Pattern } from './Pattern';

export class AlignmentPattern extends Pattern {
  constructor(x: number, y: number, moduleSize: number) {
    super(x, y, moduleSize);
  }

  public combine(x: number, y: number, moduleSize: number): AlignmentPattern {
    const combinedX = (this.x + x) / 2;
    const combinedY = (this.y + y) / 2;
    const combinedModuleSize = (this.moduleSize + moduleSize) / 2;

    return new AlignmentPattern(combinedX, combinedY, combinedModuleSize);
  }
}
