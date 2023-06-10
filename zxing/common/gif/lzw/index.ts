/**
 * @module index
 * @see https://github.com/google/dart-gif-encoder
 */

import { Dict } from './Dict';
import { DictStream } from './DictStream';
import { ByteStream } from '/common/gif/ByteStream';

export function compress(pixels: number[], depth: number, stream: ByteStream): void {
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

        // Reset dict when full
        if (!dict.add(code, pixelIndex)) {
          buffer.write(dict.bof);
          dict.reset();
        }

        code = pixelIndex;
      }
    }

    buffer.write(code);
  }

  buffer.write(dict.eof);

  buffer.pipe(stream);
}
