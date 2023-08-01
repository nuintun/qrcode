/**
 * @module Pattern
 */

import { Point } from '/common/Point';
import { toInt32 } from '/common/utils';
import { PatternRatios } from './PatternRatios';

type PatternRect = readonly [
  // Left border center x
  left: number,
  // Top border center y
  top: number,
  // Right border center x
  right: number,
  // Bottom border center y
  bottom: number
];

function calculateIntersectRatio({ ratios }: PatternRatios): number {
  return ratios[toInt32(ratios.length / 2)] / 2;
}

export class Pattern extends Point {
  #noise: number;
  #width: number;
  #height: number;
  #rect: PatternRect;
  #moduleSize: number;
  #combined: number = 1;
  #ratios: PatternRatios;
  #intersectRadius: number;

  public static noise(pattern: Pattern): number {
    return pattern.#noise;
  }

  public static width(pattern: Pattern): number {
    return pattern.#width;
  }

  public static height(pattern: Pattern): number {
    return pattern.#height;
  }

  public static combined(pattern: Pattern): number {
    return pattern.#combined;
  }

  public static rect(pattern: Pattern): PatternRect {
    return pattern.#rect;
  }

  public static equals(pattern: Pattern, x: number, y: number, width: number, height: number): boolean {
    const { modules } = pattern.#ratios;
    const intersectRadius = pattern.#intersectRadius;

    if (Math.abs(x - pattern.x) <= intersectRadius && Math.abs(y - pattern.y) <= intersectRadius) {
      const moduleSizeThis = pattern.#moduleSize;
      const moduleSize = (width + height) / modules / 2;
      const moduleSizeDiff = Math.abs(moduleSize - moduleSizeThis);

      if (moduleSizeDiff <= 1 || moduleSizeDiff <= moduleSizeThis) {
        return true;
      }
    }

    return false;
  }

  public static combine(pattern: Pattern, x: number, y: number, width: number, height: number, noise: number): Pattern {
    const combined = pattern.#combined;
    const combinedCombined = combined + 1;
    const combinedX = (pattern.x * combined + x) / combinedCombined;
    const combinedY = (pattern.y * combined + y) / combinedCombined;
    const combinedNoise = (pattern.#noise * combined + noise) / combinedCombined;
    const combinedWidth = (pattern.#width * combined + width) / combinedCombined;
    const combinedHeight = (pattern.#height * combined + height) / combinedCombined;
    const combinedPattern = new Pattern(pattern.#ratios, combinedX, combinedY, combinedWidth, combinedHeight, combinedNoise);

    combinedPattern.#combined = combinedCombined;

    return combinedPattern;
  }

  constructor(ratios: PatternRatios, x: number, y: number, width: number, height: number, noise: number) {
    super(x, y);

    const { modules } = ratios;
    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const xModuleSize = width / modules;
    const yModuleSize = height / modules;
    const xModuleSizeHalf = xModuleSize / 2;
    const yModuleSizeHalf = yModuleSize / 2;
    const ratio = calculateIntersectRatio(ratios);
    const moduleSize = (xModuleSize + yModuleSize) / 2;

    this.#noise = noise;
    this.#width = width;
    this.#height = height;
    this.#ratios = ratios;
    this.#moduleSize = moduleSize;
    this.#rect = [
      x - widthHalf + xModuleSizeHalf,
      y - heightHalf + yModuleSizeHalf,
      x + widthHalf - xModuleSizeHalf,
      y + heightHalf - yModuleSizeHalf
    ];
    this.#intersectRadius = moduleSize * ratio;
  }

  public get moduleSize(): number {
    return this.#moduleSize;
  }
}
