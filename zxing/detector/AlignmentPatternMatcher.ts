/**
 * @module AlignmentPatternMatcher
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { calculateModuleSize } from './utils/module';
import { FinderPatternGroup } from './FinderPatternGroup';
import { distance, isPointInQuadrangle, Point } from '/common/Point';
import { isEqualsSize, isMatchAlignmentPattern } from './utils/pattern';
import { ALIGNMENT_PATTERN_RATIOS, DIFF_MODULE_SIZE_RATIO } from './utils/constants';

export class AlignmentPatternMatcher extends PatternMatcher {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, ALIGNMENT_PATTERN_RATIOS, isMatchAlignmentPattern, strict);
  }

  public override match(x: number, y: number, scanline: number[]): boolean {
    scanline = scanline.slice(-3);

    return super.match(x, y, scanline, scanline[1]);
  }

  public filter({ size, moduleSize, topLeft, topRight, bottomLeft }: FinderPatternGroup): Pattern[] {
    const { matrix } = this;
    const { x, y } = topLeft;
    const correctionToTopLeft = 1 - 3 / (size - 7);
    const bottomRightX = topRight.x - x + bottomLeft.x;
    const bottomRightY = topRight.y - y + bottomLeft.y;
    const moduleSizeAvg = calculateModuleSize(moduleSize);
    // Look for an alignment pattern (10 modules in size) around where it should be
    const alignmentAreaAllowance = Math.ceil(moduleSizeAvg * 10);
    const expectAlignmentX = x + correctionToTopLeft * (bottomRightX - x);
    const expectAlignmentY = y + correctionToTopLeft * (bottomRightY - y);
    const alignmentAreaTopY = Math.max(0, expectAlignmentY - alignmentAreaAllowance);
    const alignmentAreaLeftX = Math.max(0, expectAlignmentX - alignmentAreaAllowance);
    const alignmentAreaRightX = Math.min(matrix.width - 1, expectAlignmentX + alignmentAreaAllowance);
    const alignmentAreaBottomY = Math.min(matrix.height - 1, expectAlignmentY + alignmentAreaAllowance);

    const patterns = this.patterns.filter(pattern => {
      const [xModuleSize, yModuleSize] = pattern.moduleSize;

      return (
        isEqualsSize(xModuleSize, moduleSizeAvg, DIFF_MODULE_SIZE_RATIO) &&
        isEqualsSize(yModuleSize, moduleSizeAvg, DIFF_MODULE_SIZE_RATIO) &&
        isPointInQuadrangle(
          pattern,
          new Point(alignmentAreaLeftX, alignmentAreaTopY),
          new Point(alignmentAreaRightX, alignmentAreaTopY),
          new Point(alignmentAreaRightX, alignmentAreaBottomY),
          new Point(alignmentAreaLeftX, alignmentAreaBottomY)
        )
      );
    });

    if (patterns.length > 1) {
      const expectAlignment = new Point(expectAlignmentX, expectAlignmentY);

      patterns.sort((pattern1, pattern2) => {
        const noise1 = distance(pattern1, expectAlignment) + pattern1.noise;
        const noise2 = distance(pattern2, expectAlignment) + pattern2.noise;

        return noise1 - noise2;
      });
    }

    return patterns.slice(0, 2);
  }
}
