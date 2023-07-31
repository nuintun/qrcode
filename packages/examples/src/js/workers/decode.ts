/**
 * @module decode
 */

import { binarize, Decoder, Detector, grayscale } from '@nuintun/qrcode';

interface Point {
  x: number;
  y: number;
}

export interface DecodeMessage {
  strict: boolean;
  invert: boolean;
  image: ImageBitmap;
}

export type DecodeResultMessage =
  | { type: 'error'; message: string }
  | { type: 'ok'; payload: { image: string; contents: string[] } };

type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

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
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  const luminances = grayscale(context.getImageData(0, 0, width, height));
  const binarized = binarize(luminances, width, height);

  if (data.invert) {
    binarized.flip();
  }

  const detector = new Detector({ strict: data.strict });
  const detected = detector.detect(binarized);
  const contents: string[] = [];
  const decoder = new Decoder();

  let iterator = detected.next();

  while (!iterator.done) {
    let succeed = false;

    const detect = iterator.value;

    try {
      const decoded = decoder.decode(detect.matrix);

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

      contents.push(decoded.content);

      succeed = true;
    } catch (error) {
      // 解码失败，跳过
    }

    iterator = detected.next(succeed);
  }

  if (contents.length > 0) {
    canvas.convertToBlob().then(
      blob => {
        const message: DecodeResultMessage = {
          type: 'ok',
          payload: {
            contents,
            image: URL.createObjectURL(blob)
          }
        };

        self.postMessage(message);
      },
      () => {
        const message: DecodeResultMessage = {
          type: 'error',
          message: '生成预览图失败'
        };

        self.postMessage(message);
      }
    );
  } else {
    const message: DecodeResultMessage = {
      type: 'error',
      message: '未发现二维码'
    };

    self.postMessage(message);
  }
});
