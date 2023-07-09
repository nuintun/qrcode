/**
 * @module timing
 */

import { Point } from '/common/Point';
import { toInt32 } from '/common/utils';
import { Pattern } from '/detector/Pattern';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { FinderPatternGroup } from '/detector/FinderPatternGroup';

function calculateTimingRatio(axis: number, control: number) {
  return control > axis ? 1 : control < axis ? -1 : 0;
}

function getTimingPointXAxis({ x, rect }: Pattern, ratio: number) {
  const [, right, , left] = rect;

  return ratio > 0 ? right : ratio < 0 ? left : x;
}

function getTimingPointYAxis({ y, rect }: Pattern, ratio: number) {
  const [top, , bottom] = rect;

  return ratio > 0 ? bottom : ratio < 0 ? top : y;
}

function calculateTimingLine(start: Pattern, end: Pattern, control: Pattern, isVertical?: boolean): [start: Point, end: Point] {
  const { x: endX, y: endY } = end;
  const { x: startX, y: startY } = start;
  const controlX = control.x + end.x - startX;
  const controlY = control.y + end.y - startY;
  const xRatio = calculateTimingRatio(startX, controlX);
  const yRatio = calculateTimingRatio(startY, controlY);
  const endXTranslate = getTimingPointXAxis(end, xRatio);
  const endYTranslate = getTimingPointYAxis(end, yRatio);
  const startXTranslate = getTimingPointXAxis(start, xRatio);
  const startYTranslate = getTimingPointYAxis(start, yRatio);

  if (xRatio === 0 || yRatio === 0) {
    return [new Point(startXTranslate, startYTranslate), new Point(endXTranslate, endYTranslate)];
  }

  if (isVertical ? xRatio !== yRatio : xRatio === yRatio) {
    return [new Point(startX, startYTranslate), new Point(endX, endYTranslate)];
  }

  return [new Point(startXTranslate, startY), new Point(endXTranslate, endY)];
}

function isValidTimingLine(countState: number[], moduleSize: number): boolean {
  const { length } = countState;

  if (length >= 5) {
    const lastIndex = length - 1;
    const maxRepeatPixels = Math.ceil(moduleSize * 3);

    for (let i = 1; i < lastIndex; i++) {
      if (countState[i] > maxRepeatPixels) {
        return false;
      }
    }

    return true;
  }

  return false;
}

export function checkPixelsInTimingLine(
  matrix: BitMatrix,
  { topLeft, topRight, bottomLeft, moduleSize }: FinderPatternGroup,
  isVertical?: boolean
) {
  const countState = [];
  const [start, end] = isVertical
    ? calculateTimingLine(topLeft, bottomLeft, topRight, true)
    : calculateTimingLine(topLeft, topRight, bottomLeft);
  const points = new PlotLine(start, end).points();

  let count = 0;
  let lastBit = matrix.get(toInt32(start.x), toInt32(start.y));

  for (const [x, y] of points) {
    const bit = matrix.get(x, y);

    if (bit === lastBit) {
      count++;
    } else {
      countState.push(count);

      count = 1;
      lastBit = bit;
    }
  }

  countState.push(count);

  return isValidTimingLine(countState, moduleSize[isVertical ? 1 : 0]);
}
