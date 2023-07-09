/**
 * @module AlignmentPatternMatcher
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { calculateModuleSize } from './utils/module';
import { FinderPatternGroup } from './FinderPatternGroup';
import { distance, isPointInQuadrangle, Point } from '/common/Point';
import { isEqualsModuleSize, isMatchAlignmentPattern } from './utils/pattern';

export class AlignmentPatternMatcher extends PatternMatcher {
  constructor(matrix: BitMatrix, strict?: boolean) {
    super(matrix, 5, isMatchAlignmentPattern, strict);
  }

  public override match(x: number, y: number, scanline: number[]): boolean {
    scanline = scanline.slice(-3);

    return super.match(x, y, scanline, scanline[1]);
  }

  public filter({ size, moduleSize, topLeft, topRight, bottomLeft }: FinderPatternGroup): Pattern[] {
    const { matrix } = this;
    const { x, y } = topLeft;
    // Look for an alignment pattern (10 modules in size) around where it should be
    const correctionToTopLeft = 1 - 3 / (size - 7);
    const bottomRightX = topRight.x - x + bottomLeft.x;
    const bottomRightY = topRight.y - y + bottomLeft.y;
    const moduleSizeAvg = calculateModuleSize(moduleSize);
    const alignmentAreaAllowance = Math.ceil(moduleSizeAvg * 10);
    const expectAlignmentX = x + correctionToTopLeft * (bottomRightX - x);
    const expectAlignmentY = y + correctionToTopLeft * (bottomRightY - y);
    const alignmentAreaTopY = Math.max(0, expectAlignmentY - alignmentAreaAllowance);
    const alignmentAreaLeftX = Math.max(0, expectAlignmentX - alignmentAreaAllowance);
    const alignmentAreaRightX = Math.min(matrix.width - 1, expectAlignmentX + alignmentAreaAllowance);
    const alignmentAreaBottomY = Math.min(matrix.height - 1, expectAlignmentY + alignmentAreaAllowance);
    const alignmentAreaTopLeft = new Point(alignmentAreaLeftX, alignmentAreaTopY);
    const alignmentAreaTopRight = new Point(alignmentAreaRightX, alignmentAreaTopY);
    const alignmentAreaBottomRight = new Point(alignmentAreaRightX, alignmentAreaBottomY);
    const alignmentAreaBottomLeft = new Point(alignmentAreaLeftX, alignmentAreaBottomY);

    const patterns = this.patterns.filter(pattern => {
      const [xModuleSize, yModuleSize] = pattern.moduleSize;

      return (
        isEqualsModuleSize(xModuleSize, moduleSizeAvg) &&
        isEqualsModuleSize(yModuleSize, moduleSizeAvg) &&
        isPointInQuadrangle(
          pattern,
          alignmentAreaTopLeft,
          alignmentAreaTopRight,
          alignmentAreaBottomRight,
          alignmentAreaBottomLeft
        )
      );
    });

    if (patterns.length > 1) {
      const expectAlignment = new Point(expectAlignmentX, expectAlignmentX);

      patterns.sort((pattern1, pattern2) => {
        return distance(pattern1, expectAlignment) - distance(pattern2, expectAlignment);
      });
    }

    return patterns;
  }
}
