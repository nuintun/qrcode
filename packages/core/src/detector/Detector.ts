/**
 * @module Detector
 */

import { Pattern } from './Pattern';
import { Detected } from './Detected';
import { toInt32 } from '/common/utils';
import { BitMatrix } from '/common/BitMatrix';
import { Point } from '/common/Point';
import { createTransform } from './utils/transform';
import { checkMappingTimingLine } from './utils/timing';
import { FinderPatternGroup } from './FinderPatternGroup';
import { RegressionLine } from './utils/RegressionLine';
import { ALIGNMENT_PATTERN_RATIOS } from './PatternRatios';
import { FinderPatternFinder } from './FinderPatternFinder';
import { AlignmentPatternFinder } from './AlignmentPatternFinder';
import { MIN_VERSION_SIZE_WITH_ALIGNMENTS } from '/common/Version';

export interface Options {
  /**
   * @property strict
   * @description Enable strict mode.
   */
  strict?: boolean;
}

function getExpectAlignment(finderPatternGroup: FinderPatternGroup): Pattern {
  const { x, y } = finderPatternGroup.topLeft;
  const size = FinderPatternGroup.size(finderPatternGroup);
  const expectAlignmentCorrectionToTopLeftRatio = 1 - 3 / (size - 7);
  const bottomRight = FinderPatternGroup.bottomRight(finderPatternGroup);
  const [xModuleSize, yModuleSize] = FinderPatternGroup.moduleSizes(finderPatternGroup);
  const expectAlignmentX = x + (bottomRight.x - x) * expectAlignmentCorrectionToTopLeftRatio;
  const expectAlignmentY = y + (bottomRight.y - y) * expectAlignmentCorrectionToTopLeftRatio;

  return new Pattern(ALIGNMENT_PATTERN_RATIOS, expectAlignmentX, expectAlignmentY, xModuleSize * 5, yModuleSize * 5, 0);
}

function findAlignmentInRegion(matrix: BitMatrix, finderPatternGroup: FinderPatternGroup, strict?: boolean): Pattern[] {
  const size = FinderPatternGroup.size(finderPatternGroup);
  const expectAlignment = getExpectAlignment(finderPatternGroup);
  const [xModuleSize, yModuleSize] = FinderPatternGroup.moduleSizes(finderPatternGroup);
  const moduleSize = (xModuleSize + yModuleSize) / 2;
  const { x: expectAlignmentX, y: expectAlignmentY } = expectAlignment;
  const maxAllowanceSize = Math.ceil(moduleSize * Math.min(20, size >>> 2));
  const minAllowanceSize = Math.max(4, Math.ceil(moduleSize * 3));
  const allowanceScales = [0.5, 0.75, 1, 1.25, 1.5];
  const centerOffsets = [0, 1, -1];
  const alignmentPatterns: Pattern[] = [];
  const seen = new Set<string>();
  const bottomRight = FinderPatternGroup.bottomRight(finderPatternGroup);
  const regressionLine = new RegressionLine([
    finderPatternGroup.topLeft,
    new Point(
      (finderPatternGroup.topRight.x + finderPatternGroup.bottomLeft.x) / 2,
      (finderPatternGroup.topRight.y + finderPatternGroup.bottomLeft.y) / 2
    ),
    new Point(bottomRight.x, bottomRight.y)
  ]);
  const diagonalDirection = regressionLine.direction();
  const diagonalX = diagonalDirection.x;
  const diagonalY = diagonalDirection.y;
  const diagonalLength = Math.hypot(diagonalX, diagonalY) || 1;
  const diagonalUnitX = diagonalX / diagonalLength;
  const diagonalUnitY = diagonalY / diagonalLength;
  const normalUnitX = -diagonalUnitY;
  const normalUnitY = diagonalUnitX;

  for (const scale of allowanceScales) {
    const alignmentFinder = new AlignmentPatternFinder(matrix, strict);
    const allowanceSize = Math.min(maxAllowanceSize, Math.ceil(minAllowanceSize * scale));

    for (const diagonalOffset of centerOffsets) {
      for (const normalOffset of centerOffsets) {
        const centerX =
          expectAlignmentX + diagonalUnitX * diagonalOffset * moduleSize * 2 + normalUnitX * normalOffset * moduleSize;
        const centerY =
          expectAlignmentY + diagonalUnitY * diagonalOffset * moduleSize * 2 + normalUnitY * normalOffset * moduleSize;
        const alignmentAreaTop = toInt32(Math.max(0, centerY - allowanceSize));
        const alignmentAreaLeft = toInt32(Math.max(0, centerX - allowanceSize));
        const alignmentAreaRight = toInt32(Math.min(matrix.width - 1, centerX + allowanceSize));
        const alignmentAreaBottom = toInt32(Math.min(matrix.height - 1, centerY + allowanceSize));

        alignmentFinder.find(
          alignmentAreaLeft,
          alignmentAreaTop,
          alignmentAreaRight - alignmentAreaLeft,
          alignmentAreaBottom - alignmentAreaTop
        );

        for (const pattern of alignmentFinder.filter(expectAlignment, moduleSize)) {
          const key = `${toInt32(pattern.x * 2)}:${toInt32(pattern.y * 2)}`;

          // Keep synthetic expected point for fallback only once and only in the end.
          if (key === `${toInt32(expectAlignment.x * 2)}:${toInt32(expectAlignment.y * 2)}`) {
            continue;
          }

          if (!seen.has(key)) {
            seen.add(key);
            alignmentPatterns.push(pattern);
          }
        }
      }
    }
  }

  if (alignmentPatterns.length > 1) {
    alignmentPatterns.sort((pattern1, pattern2) => {
      const transform1 = createTransform(finderPatternGroup, pattern1);
      const transform2 = createTransform(finderPatternGroup, pattern2);
      const timingScore1 =
        Number(checkMappingTimingLine(matrix, transform1, size)) +
        Number(checkMappingTimingLine(matrix, transform1, size, true));
      const timingScore2 =
        Number(checkMappingTimingLine(matrix, transform2, size)) +
        Number(checkMappingTimingLine(matrix, transform2, size, true));

      return timingScore2 - timingScore1;
    });
  }

  // Fallback candidate at last position.
  alignmentPatterns.push(expectAlignment);

  return alignmentPatterns;
}

export class Detector {
  #options: Options;

  /**
   * @constructor
   * @param options The options of detector.
   */
  constructor(options: Options = {}) {
    this.#options = options;
  }

  /**
   * @method detect Detect the binarized image matrix.
   * @param matrix The binarized image matrix.
   */
  public *detect(matrix: BitMatrix): Generator<Detected, void, boolean> {
    const { strict } = this.#options;
    const { width, height } = matrix;
    const finderFinder = new FinderPatternFinder(matrix, strict);

    finderFinder.find(0, 0, width, height);

    const finderPatternGroups = finderFinder.groups();

    let current = finderPatternGroups.next();

    while (!current.done) {
      let succeed = false;

      const finderPatternGroup = current.value;
      const size = FinderPatternGroup.size(finderPatternGroup);

      // Find alignment.
      if (size >= MIN_VERSION_SIZE_WITH_ALIGNMENTS) {
        // Kind of arbitrary -- expand search radius before giving up
        // If we didn't find alignment pattern... well try anyway without it.
        const alignmentPatterns = findAlignmentInRegion(matrix, finderPatternGroup, strict);

        // Founded alignment.
        for (const alignmentPattern of alignmentPatterns) {
          const transform = createTransform(finderPatternGroup, alignmentPattern);

          if (
            // Top left to top right.
            checkMappingTimingLine(matrix, transform, size) &&
            // Top left to bottom left.
            checkMappingTimingLine(matrix, transform, size, true)
          ) {
            succeed = yield new Detected(matrix, transform, finderPatternGroup, alignmentPattern);

            // Succeed, skip next alignment pattern.
            if (succeed) {
              break;
            }
          }
        }
      } else {
        const transform = createTransform(finderPatternGroup);

        if (
          // Top left to top right.
          checkMappingTimingLine(matrix, transform, size) &&
          // Top left to bottom left.
          checkMappingTimingLine(matrix, transform, size, true)
        ) {
          // No alignment pattern version.
          succeed = yield new Detected(matrix, transform, finderPatternGroup);
        }
      }

      current = finderPatternGroups.next(succeed);
    }
  }
}
