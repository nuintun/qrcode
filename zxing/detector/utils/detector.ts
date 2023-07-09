/**
 * @module detector
 */

import { round } from '/common/utils';
import { distance } from '/common/Point';
import { Detect } from '/detector/Detect';
import { Pattern } from '/detector/Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';
import { FinderPatternMatcher } from '/detector/FinderPatternMatcher';
import { AlignmentPatternMatcher } from '/detector/AlignmentPatternMatcher';
import { fromVersionSize, MAX_VERSION_SIZE, MIN_VERSION_SIZE } from '/common/Version';

export interface DetectResult {
  readonly matrix: BitMatrix;
  readonly alignment?: Pattern;
  readonly finder: FinderPatternGroup;
}

function calculateModuleSize({ moduleSize }: FinderPatternGroup): number {
  // Take the average
  return (moduleSize[0] + moduleSize[1]) / 2;
}

function calculateSymbolSize({ topLeft, topRight, bottomLeft }: FinderPatternGroup, moduleSize: number): number {
  const width = distance(topLeft, topRight);
  const height = distance(topLeft, bottomLeft);
  const size = round((width + height) / moduleSize / 2) + 7;

  // mod 4
  switch (size & 0x03) {
    case 0:
      return size + 1;
    case 2:
      return size - 1;
    case 3:
      if (size + 2 <= MAX_VERSION_SIZE) {
        return size + 2;
      }

      if (size - 2 >= MIN_VERSION_SIZE) {
        return size - 2;
      }

      return NaN;
  }

  return size;
}

export function detect(
  matrix: BitMatrix,
  finderMatcher: FinderPatternMatcher,
  alignmentMatcher: AlignmentPatternMatcher
): Detect[] {
  const detected: Detect[] = [];
  const finderPatternGroups = finderMatcher.groups();

  for (const finderPatternGroup of finderPatternGroups) {
    const moduleSize = calculateModuleSize(finderPatternGroup);
    const size = calculateSymbolSize(finderPatternGroup, moduleSize);

    if (size >= MIN_VERSION_SIZE && size <= MAX_VERSION_SIZE) {
      const version = fromVersionSize(size);

      // Find alignment
      if (version.alignmentPatterns.length > 0) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it
        const alignmentPatterns = alignmentMatcher.filter(finderPatternGroup, size, moduleSize);

        // Founded alignment
        for (const alignmentPattern of alignmentPatterns) {
          detected.push(new Detect(matrix, size, finderPatternGroup, alignmentPattern));
        }
      }

      // No alignment version and fallback
      detected.push(new Detect(matrix, size, finderPatternGroup));
    }
  }

  return detected;
}
