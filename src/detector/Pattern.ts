/**
 * @module Pattern
 */

import { Point } from '/common/Point';
import { PatternRect } from './utils/pattern';
import { sumArray, toInt32 } from '/common/utils';

export class Pattern extends Point {
  #noise: number;
  #width: number;
  #height: number;
  #modules: number;
  #ratios: number[];
  #rect: PatternRect;
  #moduleSize: number;
  #combined: number = 1;
  #intersectRadius: number;

  constructor(x: number, y: number, width: number, height: number, ratios: number[], noise: number) {
    super(x, y);

    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const modules = sumArray(ratios);
    const xModuleSize = width / modules;
    const yModuleSize = height / modules;
    const xModuleSizeHalf = xModuleSize / 2;
    const yModuleSizeHalf = yModuleSize / 2;
    const moduleSize = (xModuleSize + yModuleSize) / 2;
    const ratio = ratios[toInt32(ratios.length / 2)] / 2;

    this.#noise = noise;
    this.#width = width;
    this.#height = height;
    this.#ratios = ratios;
    this.#modules = modules;
    this.#moduleSize = moduleSize;
    this.#rect = Object.freeze([
      x - halfWidth + xModuleSizeHalf,
      y - halfHeight + yModuleSizeHalf,
      x + halfWidth - xModuleSizeHalf,
      y + halfHeight - yModuleSizeHalf
    ]);
    this.#intersectRadius = moduleSize * ratio;
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

  public get moduleSize(): number {
    return this.#moduleSize;
  }

  public equals(x: number, y: number, width: number, height: number): boolean {
    const modules = this.#modules;
    const intersectRadius = this.#intersectRadius;

    if (Math.abs(x - this.x) <= intersectRadius && Math.abs(y - this.y) <= intersectRadius) {
      const moduleSizeThis = this.#moduleSize;
      const moduleSize = (width + height) / modules / 2;
      const moduleSizeDiff = Math.abs(moduleSize - moduleSizeThis);

      if (moduleSizeDiff < 1 || moduleSizeDiff <= moduleSizeThis) {
        return true;
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
