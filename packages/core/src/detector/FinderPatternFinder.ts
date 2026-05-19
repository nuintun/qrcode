/**
 * @module FinderPatternFinder
 */

import { Pattern } from './Pattern';
import { round } from '/common/utils';
import { distance } from '/common/Point';
import { BitMatrix } from '/common/BitMatrix';
import { scanlineUpdate } from './utils/scanline';
import { FINDER_PATTERN_RATIOS } from './PatternRatios';
import { checkEstimateTimingLine } from './utils/timing';
import { MatchAction, PatternFinder } from './PatternFinder';
import { isEqualsSize, isMatchPattern } from './utils/pattern';
import { MAX_VERSION_SIZE, MIN_VERSION_SIZE } from '/common/Version';
import { calculateTopLeftAngle, FinderPatternGroup } from './FinderPatternGroup';
import { DIFF_MODULE_SIZE_RATIO, MAX_TOP_LEFT_ANGLE, MIN_TOP_LEFT_ANGLE } from './utils/constants';

type PatternPair = readonly [Pattern, Pattern];

function keyOfGrid(gridX: number, gridY: number): string {
  return `${gridX}:${gridY}`;
}

function buildNeighborPairs(patterns: Pattern[]): PatternPair[] {
  const pairs: PatternPair[] = [];

  if (patterns.length < 2) {
    return pairs;
  }

  const moduleSize = patterns.reduce((sum, pattern) => sum + pattern.moduleSize, 0) / patterns.length;
  // 以 module size 估算 finder 间距，构建粗粒度空间分桶，借鉴 zxing-cpp 的邻域组合思路。
  const cellSize = Math.max(moduleSize * 12, 8);
  const buckets = new Map<string, Pattern[]>();

  for (const pattern of patterns) {
    const gridX = Math.floor(pattern.x / cellSize);
    const gridY = Math.floor(pattern.y / cellSize);
    const key = keyOfGrid(gridX, gridY);
    const bucket = buckets.get(key);

    if (bucket == null) {
      buckets.set(key, [pattern]);
    } else {
      bucket.push(pattern);
    }
  }

  const queued = new Set<string>();

  for (const pattern of patterns) {
    const baseX = Math.floor(pattern.x / cellSize);
    const baseY = Math.floor(pattern.y / cellSize);

    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const bucket = buckets.get(keyOfGrid(baseX + dx, baseY + dy));

        if (bucket == null) {
          continue;
        }

        for (const candidate of bucket) {
          if (candidate === pattern || !isEqualsSize(pattern.moduleSize, candidate.moduleSize, DIFF_MODULE_SIZE_RATIO)) {
            continue;
          }

          const pairKey =
            pattern === candidate
              ? ''
              : pattern.x < candidate.x
                ? `${pattern.x},${pattern.y}|${candidate.x},${candidate.y}`
                : `${candidate.x},${candidate.y}|${pattern.x},${pattern.y}`;

          if (!queued.has(pairKey)) {
            queued.add(pairKey);
            pairs.push([pattern, candidate]);
          }
        }
      }
    }
  }

  return pairs;
}

function isGroupNested(finderPatternGroup: FinderPatternGroup, patterns: Pattern[], used: Map<Pattern, boolean>): boolean {
  let count = 0;

  const { topLeft, topRight, bottomLeft } = finderPatternGroup;

  for (const pattern of patterns) {
    if (pattern !== topLeft && pattern !== topRight && pattern !== bottomLeft) {
      let contain: boolean | undefined;

      if (used.has(pattern)) {
        contain = FinderPatternGroup.contains(finderPatternGroup, pattern);

        if (contain) {
          return true;
        }
      }

      if (
        Pattern.noise(pattern) < 1 &&
        (contain == null ? FinderPatternGroup.contains(finderPatternGroup, pattern) : contain)
      ) {
        // Maybe contain another QR code, but we only allow one, because this is not a normal mode.
        if (++count > 3) {
          return true;
        }
      }
    }
  }

  return false;
}

export class FinderPatternFinder extends PatternFinder {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, FINDER_PATTERN_RATIOS, strict);
  }

  public *groups(): Generator<FinderPatternGroup, void, boolean> {
    const patterns = this.patterns.filter(pattern => {
      return Pattern.combined(pattern) >= 3 && Pattern.noise(pattern) <= 1.5;
    });
    const { length } = patterns;

    if (length === 3) {
      const finderPatternGroup = new FinderPatternGroup(this.matrix, patterns);
      const size = FinderPatternGroup.size(finderPatternGroup);

      if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
        yield finderPatternGroup;
      }
    } else if (length > 3) {
      const used = new Map<Pattern, boolean>();
      const pairs = buildNeighborPairs(patterns);

      for (const [pattern1, pattern2] of pairs) {
        if (used.has(pattern1) || used.has(pattern2)) {
          continue;
        }

        for (const pattern3 of patterns) {
          if (
            pattern3 === pattern1 ||
            pattern3 === pattern2 ||
            used.has(pattern1) ||
            used.has(pattern2) ||
            !isEqualsSize(pattern1.moduleSize, pattern3.moduleSize, DIFF_MODULE_SIZE_RATIO) ||
            !isEqualsSize(pattern2.moduleSize, pattern3.moduleSize, DIFF_MODULE_SIZE_RATIO)
          ) {
            continue;
          }

          const { matrix } = this;
          const finderPatternGroup = new FinderPatternGroup(matrix, [pattern1, pattern2, pattern3]);
          const angle = calculateTopLeftAngle(finderPatternGroup);

          if (angle >= MIN_TOP_LEFT_ANGLE && angle <= MAX_TOP_LEFT_ANGLE) {
            const [xModuleSize, yModuleSize] = FinderPatternGroup.moduleSizes(finderPatternGroup);

            if (xModuleSize >= 1 && yModuleSize >= 1) {
              const { topLeft, topRight, bottomLeft } = finderPatternGroup;
              const edge1 = distance(topLeft, topRight);
              const edge2 = distance(topLeft, bottomLeft);
              const edge1Modules = round(edge1 / xModuleSize);
              const edge2Modules = round(edge2 / yModuleSize);

              if (Math.abs(edge1Modules - edge2Modules) <= 4) {
                const size = FinderPatternGroup.size(finderPatternGroup);

                if (
                  size >= MIN_VERSION_SIZE &&
                  size <= MAX_VERSION_SIZE &&
                  !isGroupNested(finderPatternGroup, patterns, used)
                ) {
                  if (
                    checkEstimateTimingLine(matrix, finderPatternGroup) ||
                    checkEstimateTimingLine(matrix, finderPatternGroup, true)
                  ) {
                    if (yield finderPatternGroup) {
                      used.set(pattern1, true);
                      used.set(pattern2, true);
                      used.set(pattern3, true);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  public find(left: number, top: number, width: number, height: number): void {
    const { matrix } = this;
    const right = left + width;
    const bottom = top + height;
    const match: MatchAction = (x, y, scanline, count, scanlineBits, lastBit) => {
      scanlineUpdate(scanline, count);
      scanlineUpdate(scanlineBits, lastBit);

      // Match pattern black-white-black-white-black.
      if (
        scanlineBits[0] === 1 &&
        scanlineBits[1] === 0 &&
        scanlineBits[2] === 1 &&
        scanlineBits[3] === 0 &&
        scanlineBits[4] === 1 &&
        isMatchPattern(scanline, FINDER_PATTERN_RATIOS)
      ) {
        this.match(x, y, scanline, scanline[2]);
      }
    };

    for (let y = top; y < bottom; y++) {
      let x = left;

      // Burn off leading white pixels before anything else; if we start in the middle of
      // a white run, it doesn't make sense to count its length, since we don't know if the
      // white run continued to the left of the start point.
      while (x < right && !matrix.get(x, y)) {
        x++;
      }

      let count = 0;
      let lastBit = matrix.get(x, y);

      const scanline = [0, 0, 0, 0, 0];
      const scanlineBits = [-1, -1, -1, -1, -1];

      while (x < right) {
        const bit = matrix.get(x, y);

        if (bit === lastBit) {
          count++;
        } else {
          match(x, y, scanline, count, scanlineBits, lastBit);

          count = 1;
          lastBit = bit;
        }

        x++;
      }

      match(x, y, scanline, count, scanlineBits, lastBit);
    }
  }
}
