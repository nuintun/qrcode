/**
 * @module timing
 */

import { Point } from '/common/Point';
import { toInt32 } from '/common/utils';
import { PlotLine } from '/common/PlotLine';
import { BitMatrix } from '/common/BitMatrix';
import { PerspectiveTransform } from '/common/PerspectiveTransform';

function isValidTimingLine(matrix: BitMatrix, start: Point, end: Point, size: number): boolean {
  const maxModules = size + 8;
  const points = new PlotLine(start, end).points();

  let modules = 1;
  let lastBit = matrix.get(toInt32(start.x), toInt32(start.y));

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

  return modules >= size - 14 - Math.max(2, (size - 17) / 4);
}

export function checkModulesInTimingLine(
  matrix: BitMatrix,
  transform: PerspectiveTransform,
  size: number,
  isVertical?: boolean
): boolean {
  const [startX, startY] = transform.mapping(isVertical ? 6.5 : 7.5, isVertical ? 7.5 : 6.5);
  const [endX, endY] = transform.mapping(isVertical ? 6.5 : size - 7.5, isVertical ? size - 7.5 : 6.5);

  return isValidTimingLine(matrix, new Point(startX, startY), new Point(endX, endY), size);
}
