/**
 * @module Pattern
 */

import { Point } from '/common/Point';
import { ModuleSizeGroup } from './utils/module';
import { sumArray, toInt32 } from '/common/utils';

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
  #ratio: number;
  #width: number;
  #height: number;
  #modules: number;
  #ratios: number[];
  #rect: PatternRect;
  #combined: number = 1;
  #moduleSize: ModuleSizeGroup;

  constructor(x: number, y: number, width: number, height: number, ratios: number[], noise: number) {
    super(x, y);

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const modules = sumArray(ratios);
    const xModuleSize = width / modules;
    const yModuleSize = height / modules;
    const xModuleSizeHalf = xModuleSize / 2;
    const yModuleSizeHalf = yModuleSize / 2;

    this.#noise = noise;
    this.#width = width;
    this.#height = height;
    this.#ratios = ratios;
    this.#modules = modules;
    this.#rect = [
      x - halfWidth + xModuleSizeHalf,
      y - halfHeight + yModuleSizeHalf,
      x + halfWidth - xModuleSizeHalf,
      y + halfHeight - yModuleSizeHalf
    ];
    this.#moduleSize = [xModuleSize, yModuleSize];
    this.#ratio = ratios[toInt32(ratios.length / 2)];
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
    const ratio = this.#ratio;
    const modules = this.#modules;
    const moduleSize = this.#moduleSize;
    const xModuleSize = width / modules;
    const [xModuleSizeThis] = moduleSize;

    if (Math.abs(x - this.x) <= Math.max(xModuleSize, xModuleSizeThis) * ratio) {
      const xModuleSizeDiff = Math.abs(xModuleSize - xModuleSizeThis);

      if (xModuleSizeDiff >= 1 && xModuleSizeDiff > xModuleSizeThis) {
        return false;
      }

      const yModuleSize = height / modules;
      const [, yModuleSizeThis] = moduleSize;

      if (Math.abs(y - this.y) <= Math.max(yModuleSize, yModuleSizeThis) * ratio) {
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
    const pattern = new Pattern(combinedX, combinedY, combinedWidth, combinedHeight, this.#ratios, combinedNoise);

    pattern.#combined = nextCombined;

    return pattern;
  }
}
