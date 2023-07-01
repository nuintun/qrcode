/**
 * @module Pattern
 */

import { Point } from '/common/Point';

export class Pattern extends Point {
  #count: number;
  #moduleSize: number;

  constructor(x: number, y: number, moduleSize: number, count: number = 1) {
    super(x, y);

    this.#count = count;
    this.#moduleSize = moduleSize;
  }

  public get moduleSize(): number {
    return this.#moduleSize;
  }

  public combine(x: number, y: number, moduleSize: number): Pattern {
    const count = this.#count;
    const combinedCount = count + 1;
    const combinedX = (count * this.x + x) / combinedCount;
    const combinedY = (count * this.y + y) / combinedCount;
    const combinedModuleSize = (count * this.#moduleSize + moduleSize) / combinedCount;

    return new Pattern(combinedX, combinedY, combinedModuleSize, combinedCount);
  }

  public equals(x: number, y: number, moduleSize: number): boolean {
    if (Math.abs(x - this.x) <= moduleSize && Math.abs(y - this.y) <= moduleSize) {
      const currentModuleSize = this.#moduleSize;
      const moduleSizeDiff = Math.abs(moduleSize - currentModuleSize);

      return moduleSizeDiff < 1 || moduleSizeDiff <= currentModuleSize;
    }

    return false;
  }
}
