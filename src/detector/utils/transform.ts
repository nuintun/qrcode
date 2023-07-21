/**
 * @module transform
 */

import { Pattern } from '/detector/Pattern';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';
import { PerspectiveTransform, quadrilateralToQuadrilateral } from '/common/PerspectiveTransform';

export function createTransform(finderPatternGroup: FinderPatternGroup, alignmentPattern?: Pattern): PerspectiveTransform {
  let bottomRightX;
  let bottomRightY;
  let sourceBottomRightX;
  let sourceBottomRightY;

  const { x: topLeftX, y: topLeftY } = finderPatternGroup.topLeft;
  const { x: topRightX, y: topRightY } = finderPatternGroup.topRight;
  const { x: bottomLeftX, y: bottomLeftY } = finderPatternGroup.bottomLeft;
  const sizeMinusThree = FinderPatternGroup.size(finderPatternGroup) - 3.5;

  if (alignmentPattern != null) {
    bottomRightX = alignmentPattern.x;
    bottomRightY = alignmentPattern.y;
    sourceBottomRightX = sizeMinusThree - 3;
    sourceBottomRightY = sourceBottomRightX;
  } else {
    // Don't have an alignment pattern, just make up the bottom-right point
    bottomRightX = topRightX + bottomLeftX - topLeftX;
    bottomRightY = topRightY + bottomLeftY - topLeftY;
    sourceBottomRightX = sizeMinusThree;
    sourceBottomRightY = sizeMinusThree;
  }

  return quadrilateralToQuadrilateral(
    3.5,
    3.5,
    sizeMinusThree,
    3.5,
    sourceBottomRightX,
    sourceBottomRightY,
    3.5,
    sizeMinusThree,
    topLeftX,
    topLeftY,
    topRightX,
    topRightY,
    bottomRightX,
    bottomRightY,
    bottomLeftX,
    bottomLeftY
  );
}
