/**
 * @module decode
 */

import { binarize, Decoder, Detector, grayscale, Pattern as IPattern, Point as IPoint } from '@nuintun/qrcode';

export interface Point {
  x: number;
  y: number;
}

export interface DecodedOk {
  type: 'ok';
  payload: {
    uid: string;
    image: ImageBitmap;
    items: DecodedItem[];
  };
}

export interface DecodedError {
  type: 'error';
  message: string;
}

export interface DecodeMessage {
  uid: string;
  strict: boolean;
  invert: boolean;
  image: ImageBitmap;
}

export interface Pattern extends Point {
  moduleSize: number;
}

export type DecodeResultMessage = DecodedOk | DecodedError;

export interface DecodedItem {
  content: string;
  alignment: Pattern | null;
  timing: [topLeft: Point, topRight: Point, bottomLeft: Point];
  finder: [topLeft: Pattern, topRight: Pattern, bottomLeft: Pattern];
  corners: [topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point];
}

function toPoint(point: IPoint): Point {
  return {
    x: point.x,
    y: point.y
  };
}

function toPattern(pattern: IPattern): Pattern {
  return {
    x: pattern.x,
    y: pattern.y,
    moduleSize: pattern.moduleSize
  };
}

self.addEventListener('message', async ({ data }: MessageEvent<DecodeMessage>) => {
  const { uid, image } = data;
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
  const success: DecodedItem[] = [];
  const decoder = new Decoder();

  let iterator = detected.next();

  while (!iterator.done) {
    let succeed = false;

    const detect = iterator.value;

    try {
      const { size, finder, alignment } = detect;
      const decoded = decoder.decode(detect.matrix);
      // Finder
      const { topLeft, topRight, bottomLeft } = finder;
      // Corners
      const topLeftCorner = detect.mapping(0, 0);
      const topRightCorner = detect.mapping(size, 0);
      const bottomRightCorner = detect.mapping(size, size);
      const bottomLeftCorner = detect.mapping(0, size);
      // Timing
      const topLeftTiming = detect.mapping(6.5, 6.5);
      const topRightTiming = detect.mapping(size - 6.5, 6.5);
      const bottomLeftTiming = detect.mapping(6.5, size - 6.5);

      success.push({
        content: decoded.content,
        alignment: alignment ? toPattern(alignment) : null,
        finder: [toPattern(topLeft), toPattern(topRight), toPattern(bottomLeft)],
        timing: [toPoint(topLeftTiming), toPoint(topRightTiming), toPoint(bottomLeftTiming)],
        corners: [toPoint(topLeftCorner), toPoint(topRightCorner), toPoint(bottomRightCorner), toPoint(bottomLeftCorner)]
      });

      succeed = true;
    } catch (error) {
      // 解码失败，跳过
    }

    iterator = detected.next(succeed);
  }

  if (success.length > 0) {
    const message: DecodedOk = {
      type: 'ok',
      payload: {
        uid,
        image,
        items: success
      }
    };

    self.postMessage(message, [image]);
  } else {
    const message: DecodedError = {
      type: 'error',
      message: '未发现二维码'
    };

    self.postMessage(message);
  }
});
