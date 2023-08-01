/**
 * @module locate
 */

import { Pattern, Point } from '/js/workers/decode';

export type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export function markPattern(context: Context2D, { x, y, moduleSize }: Pattern, fillStyle: string): void {
  context.save();

  context.fillStyle = fillStyle;

  context.beginPath();
  context.arc(x, y, moduleSize * 0.6, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

export function drawLine(context: Context2D, { x: x1, y: y1 }: Point, { x: x2, y: y2 }: Point, strokeStyle: string): void {
  context.save();

  context.lineWidth = 1;
  context.strokeStyle = strokeStyle;

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}
