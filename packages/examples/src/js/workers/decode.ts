/**
 * @module decode
 */

import { Decoder, Detector, binarize } from '@nuintun/qrcode';

export interface DecodeMessage {
  strict: boolean;
  invert: boolean;
  image: ImageBitmap;
}

self.addEventListener('message', ({ data }: MessageEvent<DecodeMessage>) => {
  const { image } = data;
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context2d = canvas.getContext('2d');

  if (context2d) {
    context2d.drawImage(image, 0, 0);

    const binarized = binarize(context2d.getImageData(0, 0, width, height));

    if (data.invert) {
      binarized.flip();
    }

    const detector = new Detector({ strict: data.strict });
    const detected = detector.detect(binarized);
    const decoder = new Decoder();

    let iterator = detected.next();

    while (!iterator.done) {
      let succeed = false;

      const detect = iterator.value;

      try {
        const { matrix } = detect;
        const decoded = decoder.decode(matrix);
        const { content } = decoded;

        console.log(content);

        succeed = true;
      } catch (error) {
        // 解码失败，跳过
      }

      iterator = detected.next(succeed);
    }
  }

  self.postMessage([]);
});
