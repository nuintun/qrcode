/**
 * @module timing
 */

import { Point } from '/common/Point';
import { toUint32 } from '/common/utils';
import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';
import { PerspectiveTransform } from '/common/PerspectiveTransform';

function calculateEstimateTimingRatio(axis: number, control: number): number {
  return control > axis ? 1 : control < axis ? -1 : 0;
}

function getEstimateTimingPointXAxis(pattern: Pattern, ratio: number): number {
  const [left, , right] = Pattern.rect(pattern);

  return ratio > 0 ? right : ratio < 0 ? left : pattern.x;
}

function getEstimateTimingPointYAxis(pattern: Pattern, ratio: number): number {
  const [, top, , bottom] = Pattern.rect(pattern);

  return ratio > 0 ? bottom : ratio < 0 ? top : pattern.y;
}

function getEstimateTimingLine(
  start: Pattern,
  end: Pattern,
  control: Pattern,
  isVertical?: boolean
): [start: Point, end: Point] {
  const { x: endX, y: endY } = end;
  const { x: startX, y: startY } = start;
  const { x: controlX, y: controlY } = control;
  const xRatio = calculateEstimateTimingRatio(endX, controlX);
  const yRatio = calculateEstimateTimingRatio(endY, controlY);
  const endXTranslate = getEstimateTimingPointXAxis(end, xRatio);
  const endYTranslate = getEstimateTimingPointYAxis(end, yRatio);
  const startXTranslate = getEstimateTimingPointXAxis(start, xRatio);
  const startYTranslate = getEstimateTimingPointYAxis(start, yRatio);

  if (xRatio === 0 || yRatio === 0) {
    return [new Point(startXTranslate, startYTranslate), new Point(endXTranslate, endYTranslate)];
  }

  if (isVertical ? xRatio === yRatio : xRatio !== yRatio) {
    return [new Point(startX, startYTranslate), new Point(endX, endYTranslate)];
  }

  return [new Point(startXTranslate, startY), new Point(endXTranslate, endY)];
}

function isValidTimingLine(matrix: BitMatrix, start: Point, end: Point, size: number): boolean {
  const maxModules = size + 8;
  const points = new PlotLine(start, end).points();

  let modules = 1;
  let lastBit = matrix.get(toUint32(start.x), toUint32(start.y));

  for (const [x, y] of points) {
    const bit = matrix.get(x, y);

    if (bit !== lastBit) {
      modules++;
      lastBit = bit;

      if (modules > maxModules) {
        return false;
      }
    }
  }

  return modules >= size - 14 - Math.max(2, toUint32((size - 17) >> 2));
}

export function checkEstimateTimingLine(
  matrix: BitMatrix,
  finderPatternGroup: FinderPatternGroup,
  isVertical?: boolean
): boolean {
  const { topLeft, topRight, bottomLeft } = finderPatternGroup;
  const [start, end] = isVertical
    ? getEstimateTimingLine(topLeft, bottomLeft, topRight, true)
    : getEstimateTimingLine(topLeft, topRight, bottomLeft);

  return isValidTimingLine(matrix, start, end, FinderPatternGroup.size(finderPatternGroup));
}

export function checkMappingTimingLine(
  matrix: BitMatrix,
  transform: PerspectiveTransform,
  size: number,
  isVertical?: boolean
): boolean {
  const [startX, startY] = transform.mapping(isVertical ? 6.5 : 7.5, isVertical ? 7.5 : 6.5);
  const [endX, endY] = transform.mapping(isVertical ? 6.5 : size - 7.5, isVertical ? size - 7.5 : 6.5);

  return isValidTimingLine(matrix, new Point(startX, startY), new Point(endX, endY), size);
}
