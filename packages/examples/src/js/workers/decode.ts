/**
 * @module decode
 */

import { binarize, Decoder, Detector } from '@nuintun/qrcode';

interface Point {
  x: number;
  y: number;
}

export interface DecodeItem {
  image: string;
  content: string;
}

export interface DecodeMessage {
  strict: boolean;
  invert: boolean;
  image: ImageBitmap;
}

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type DecodeResultMessage = { type: 'ok'; data: DecodeItem[] } | { type: 'error'; data: string };

function getImageData(image: ImageBitmap): ImageData {
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, width, height);
}

function drawLine(
  context: Context2D,
  { x: x1, y: y1 }: Point,
  { x: x2, y: y2 }: Point,
  lineWidth: number,
  strokeStyle: string
): void {
  context.save();

  context.lineWidth = lineWidth;
  context.strokeStyle = strokeStyle;

  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

function markPoint(context: Context2D, { x, y }: Point, radius: number, fillStyle: string): void {
  context.save();

  context.fillStyle = fillStyle;

  context.beginPath();
  context.arc(x, y, radius * 0.6, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

self.addEventListener('message', async ({ data }: MessageEvent<DecodeMessage>) => {
  const { image } = data;
  const binarized = binarize(getImageData(image));

  if (data.invert) {
    binarized.flip();
  }

  const canvas = new OffscreenCanvas(image.width, image.height);
  const detector = new Detector({ strict: data.strict });
  const detected = detector.detect(binarized);
  const context = canvas.getContext('2d')!;
  const success: DecodeItem[] = [];
  const decoder = new Decoder();

  let iterator = detected.next();

  while (!iterator.done) {
    let succeed = false;

    const detect = iterator.value;

    try {
      const decoded = decoder.decode(detect.matrix);

      context.drawImage(image, 0, 0);

      const { size, finder, alignment } = detect;
      const topLeftCorner = detect.mapping(0, 0);
      const topRightCorner = detect.mapping(size, 0);
      const bottomLeftCorner = detect.mapping(0, size);
      const bottomRightCorner = detect.mapping(size, size);

      drawLine(context, topLeftCorner, topRightCorner, 1, '#00ff00');
      drawLine(context, topRightCorner, bottomRightCorner, 1, '#00ff00');
      drawLine(context, bottomRightCorner, bottomLeftCorner, 1, '#00ff00');
      drawLine(context, bottomLeftCorner, topLeftCorner, 1, '#00ff00');

      const topLeftTiming = detect.mapping(6.5, 6.5);
      const topRightTiming = detect.mapping(size - 6.5, 6.5);
      const bottomLeftTiming = detect.mapping(6.5, size - 6.5);

      drawLine(context, topLeftTiming, topRightTiming, 1, '#00ff00');
      drawLine(context, topLeftTiming, bottomLeftTiming, 1, '#00ff00');

      const { topLeft, topRight, bottomLeft } = finder;

      drawLine(context, topLeft, topRight, 1, '#ff0000');
      drawLine(context, topLeft, bottomLeft, 1, '#ff0000');

      markPoint(context, topLeft, topLeft.moduleSize, '#ff0000');
      markPoint(context, topRight, topRight.moduleSize, '#00ff00');
      markPoint(context, bottomLeft, bottomLeft.moduleSize, '#0000ff');

      if (alignment) {
        markPoint(context, alignment, alignment.moduleSize, '#ff00ff');
      }

      await canvas.convertToBlob().then(blob => {
        success.push({
          content: decoded.content,
          image: URL.createObjectURL(blob)
        });
      });

      succeed = true;
    } catch (error) {
      // 解码失败，跳过
    }

    iterator = detected.next(succeed);
  }

  if (success.length) {
    self.postMessage({ type: 'ok', data: success });
  } else {
    self.postMessage({ type: 'error', data: '未发现二维码' });
  }
});
