/**
 * @module AlignmentPatternMatcher
 */

import { Pattern } from './Pattern';
import { BitMatrix } from '/common/BitMatrix';
import { PatternMatcher } from './PatternMatcher';
import { FinderPatternGroup } from './FinderPatternGroup';
import { distance, isPointInQuadrangle, Point } from '/common/Point';
import { isEqualsModuleSize, isMatchAlignmentPattern } from './utils/matcher';

export class AlignmentPatternMatcher extends PatternMatcher {
  constructor(matrix: BitMatrix) {
    super(matrix, 5, isMatchAlignmentPattern);
  }

  public filter({ topLeft, topRight, bottomLeft }: FinderPatternGroup, size: number, moduleSize: number): Pattern[] {
    const { matrix } = this;
    const { x, y } = topLeft;
    // Look for an alignment pattern (3 modules in size) around where it should be
    const allowance = Math.ceil(moduleSize * 5);
    const correctionToTopLeft = 1 - 3 / (size - 7);
    const bottomRightX = topRight.x - x + bottomLeft.x;
    const bottomRightY = topRight.y - y + bottomLeft.y;
    const expectAlignmentX = x + correctionToTopLeft * (bottomRightX - x);
    const expectAlignmentY = y + correctionToTopLeft * (bottomRightY - y);
    const alignmentAreaTopY = Math.max(0, expectAlignmentY - allowance);
    const alignmentAreaLeftX = Math.max(0, expectAlignmentX - allowance);
    const alignmentAreaRightX = Math.min(matrix.width - 1, expectAlignmentX + allowance);
    const alignmentAreaBottomY = Math.min(matrix.height - 1, expectAlignmentY + allowance);
    const alignmentAreaTopLeft = new Point(alignmentAreaLeftX, alignmentAreaTopY);
    const alignmentAreaTopRight = new Point(alignmentAreaRightX, alignmentAreaTopY);
    const alignmentAreaBottomRight = new Point(alignmentAreaRightX, alignmentAreaBottomY);
    const alignmentAreaBottomLeft = new Point(alignmentAreaLeftX, alignmentAreaBottomY);

    const patterns = this.patterns.filter(pattern => {
      return (
        isEqualsModuleSize(pattern.moduleSize, moduleSize) &&
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
