/**
 * @module index
 */

import { Dict } from './Dict';
import { DictStream } from './DictStream';
import { ByteArray } from '/common/gif/ByteArray';

export function compress(pixels: number[], depth: number, stream: ByteArray): void {
  const dict = new Dict(depth);
  const buffer = new DictStream(dict);

  buffer.write(dict.bof);

  if (pixels.length > 0) {
    let code = pixels[0];

    const { length } = pixels;

    for (let i = 1; i < length; i++) {
      const pixelIndex = pixels[i];
      const nextCode = dict.get(code, pixelIndex);

      if (nextCode != null) {
        code = nextCode;
      } else {
        buffer.write(code);
        dict.add(code, pixelIndex);

        code = pixelIndex;
      }
    }

    buffer.write(code);
  }

  buffer.write(dict.eof);

  buffer.pipe(stream);
}
