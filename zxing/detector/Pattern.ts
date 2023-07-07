/**
 * @module Pattern
 */

import { Point } from '/common/Point';

export type PatternRect = [
  // Top border center y
  top: number,
  // Right border center x
  right: number,
  // Bottom border center y
  bottom: number,
  // Left border center x
  left: number
];

export class Pattern extends Point {
  #width: number;
  #height: number;
  #modules: number;
  #rect: PatternRect;
  #combined: number = 1;
  #moduleSize: [x: number, y: number];

  constructor(x: number, y: number, width: number, height: number, modules: number) {
    super(x, y);

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const xModuleSize = width / modules;
    const yModuleSize = height / modules;
    const xModuleSizeHalf = xModuleSize / 2;
    const yModuleSizeHalf = yModuleSize / 2;

    this.#width = width;
    this.#height = height;
    this.#modules = modules;
    this.#rect = [
      y - halfHeight + yModuleSizeHalf,
      x + halfWidth - xModuleSizeHalf,
      y + halfHeight - yModuleSizeHalf,
      x - halfWidth + xModuleSizeHalf
    ];
    this.#moduleSize = [xModuleSize, yModuleSize];
  }

  public get width(): number {
    return this.#width;
  }

  public get height(): number {
    return this.#height;
  }

  public get combined(): number {
    return this.#combined;
  }

  public get rect(): PatternRect {
    return this.#rect;
  }

  public get moduleSize(): [x: number, y: number] {
    return this.#moduleSize;
  }

  public equals(x: number, y: number, width: number, height: number): boolean {
    const modules = this.#modules;
    const xModuleSize = width / modules;
    const yModuleSize = height / modules;

    if (Math.abs(x - this.x) <= xModuleSize && Math.abs(y - this.y) <= yModuleSize) {
      const [xModuleSizeThis, yModuleSizeThis] = this.#moduleSize;
      const xModuleSizeDiff = Math.abs(xModuleSize - xModuleSizeThis);
      const yModuleSizeDiff = Math.abs(yModuleSize - yModuleSizeThis);

      if (
        (xModuleSizeDiff < 1 || xModuleSizeDiff <= xModuleSizeThis) &&
        (yModuleSizeDiff < 1 || yModuleSizeDiff <= yModuleSizeThis)
      ) {
        return true;
      }
    }

    return false;
  }

  public combine(x: number, y: number, width: number, height: number): Pattern {
    const combined = this.#combined;
    const nextCombined = combined + 1;
    const combinedX = (combined * this.x + x) / nextCombined;
    const combinedY = (combined * this.y + y) / nextCombined;
    const combinedWidth = (combined * this.#width + width) / nextCombined;
    const combinedHeight = (combined * this.#height + height) / nextCombined;
    const pattern = new Pattern(combinedX, combinedY, combinedWidth, combinedHeight, this.#modules);

    pattern.#combined = nextCombined;

    return pattern;
  }
}
