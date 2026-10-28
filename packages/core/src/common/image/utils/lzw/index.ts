/**
 * @module index
 * @see https://github.com/google/dart-gif-encoder
 */

import { Dict } from './Dict';
import { DictStream } from './DictStream';
import { ByteStream } from '/common/image/utils/ByteStream';

/**
 * LZW-compresses `pixels` (values < 2 ^ depth) into GIF minimum-code-size data
 * sub-blocks on `stream`. The dictionary starts at `depth + 1` bits, grows up
 * to 12 bits and emits a clear code when full.
 */
export function compress(pixels: Uint8Array, depth: number, stream: ByteStream): void {
  const dict = new Dict(depth);
  const buffer = new DictStream(dict);

  buffer.write(dict.bof);

  if (pixels.length > 0) {
    let code = pixels[0];

    const { length } = pixels;

    for (let i = 1; i < length; i++) {
      const pixelIndex = pixels[i];
      const nextCode = dict.get(code, pixelIndex);

      if (nextCode !== 0) {
        code = nextCode;
      } else {
        buffer.write(code);

        // Reset dict when full.
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
