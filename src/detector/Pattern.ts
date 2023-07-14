/**
 * @module Pattern
 */

import { Point } from '/common/Point';
import { ModuleSizeGroup } from './utils/module';

export type PatternRect = [
  // Left border center x
  left: number,
  // Top border center y
  top: number,
  // Right border center x
  right: number,
  // Bottom border center y
  bottom: number
];

export class Pattern extends Point {
  #noise: number;
  #width: number;
  #height: number;
  #modules: number;
  #rect: PatternRect;
  #combined: number = 1;
  #moduleSize: ModuleSizeGroup;

  constructor(x: number, y: number, width: number, height: number, modules: number, noise: number) {
    super(x, y);

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const xModuleSize = width / modules;
    const yModuleSize = height / modules;
    const xModuleSizeHalf = xModuleSize / 2;
    const yModuleSizeHalf = yModuleSize / 2;

    this.#noise = noise;
    this.#width = width;
    this.#height = height;
    this.#modules = modules;
    this.#rect = [
      x - halfWidth + xModuleSizeHalf,
      y - halfHeight + yModuleSizeHalf,
      x + halfWidth - xModuleSizeHalf,
      y + halfHeight - yModuleSizeHalf
    ];
    this.#moduleSize = [xModuleSize, yModuleSize];
  }

  public get noise(): number {
    return this.#noise;
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

  public get moduleSize(): ModuleSizeGroup {
    return this.#moduleSize;
  }

  public equals(x: number, y: number, width: number, height: number): boolean {
    const modules = this.#modules;
    const xModuleSize = width / modules;

    if (Math.abs(x - this.x) <= xModuleSize) {
      const moduleSize = this.#moduleSize;
      const [xModuleSizeThis] = moduleSize;
      const xModuleSizeDiff = Math.abs(xModuleSize - xModuleSizeThis);

      if (xModuleSizeDiff >= 1 && xModuleSizeDiff > xModuleSizeThis) {
        return false;
      }

      const yModuleSize = height / modules;

      if (Math.abs(y - this.y) <= yModuleSize) {
        const [, yModuleSizeThis] = moduleSize;
        const yModuleSizeDiff = Math.abs(yModuleSize - yModuleSizeThis);

        if (yModuleSizeDiff < 1 || yModuleSizeDiff <= yModuleSizeThis) {
          return true;
        }
      }
    }

    return false;
  }

  public combine(x: number, y: number, width: number, height: number, noise: number): Pattern {
    const combined = this.#combined;
    const nextCombined = combined + 1;
    const combinedX = (combined * this.x + x) / nextCombined;
    const combinedY = (combined * this.y + y) / nextCombined;
    const combinedNoise = (combined * this.#noise + noise) / nextCombined;
    const combinedWidth = (combined * this.#width + width) / nextCombined;
    const combinedHeight = (combined * this.#height + height) / nextCombined;
    const pattern = new Pattern(combinedX, combinedY, combinedWidth, combinedHeight, this.#modules, combinedNoise);

    pattern.#combined = nextCombined;

    return pattern;
  }
}