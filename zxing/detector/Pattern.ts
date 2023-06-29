/**
 * @module Pattern
 */

import { Point } from '/common/Point';

export class Pattern extends Point {
  #moduleSize: number;

  constructor(x: number, y: number, moduleSize: number) {
    super(x, y);

    this.#moduleSize = moduleSize;
  }

  public get moduleSize(): number {
    return this.#moduleSize;
  }

  public combine(x: number, y: number, moduleSize: number): Pattern {
    const combinedX = (this.x + x) / 2;
    const combinedY = (this.y + y) / 2;
    const combinedModuleSize = (this.#moduleSize + moduleSize) / 2;

    return new Pattern(combinedX, combinedY, combinedModuleSize);
  }

  public equals(x: number, y: number, moduleSize: number): boolean {
    if (Math.abs(x - this.x) <= moduleSize && Math.abs(y - this.y) <= moduleSize) {
      const currentModuleSize = this.#moduleSize;
      const moduleSizeDiff = Math.abs(moduleSize - currentModuleSize);

      return moduleSizeDiff <= 1 || moduleSizeDiff <= currentModuleSize;
    }

    return false;
  }
}
