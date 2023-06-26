/**
 * @module FinderPattern
 */

import { Pattern } from './Pattern';

export class FinderPattern extends Pattern {
  #count: number;

  constructor(x: number, y: number, moduleSize: number, count: number = 1) {
    super(x, y, moduleSize);

    this.#count = count;
  }

  public get count(): number {
    return this.#count;
  }

  public combine(x: number, y: number, moduleSize: number): FinderPattern {
    const count = this.#count;
    const combinedCount = count + 1;
    const combinedX = Math.floor((this.x * count + x) / combinedCount);
    const combinedY = Math.floor((this.y * count + y) / combinedCount);
    const combinedModuleSize = Math.floor((this.moduleSize * count + moduleSize) / combinedCount);

    return new FinderPattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }
}
