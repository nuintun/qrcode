/**
 * @module index
 */

import { Dict } from './Dict';
import { GifWriter } from './GifWriter';
import { LzwWriter } from './LzwWriter';

export { GifWriter };

/**
 * LZW-compresses `pixels` (values < 2 ^ depth) into GIF minimum-code-size data
 * sub-blocks on `stream`. The dictionary starts at `depth + 1` bits, grows up
 * to 12 bits and emits a clear code when full.
 */
export function compress(pixels: Uint8Array, depth: number, stream: GifWriter): void {
  const dict = new Dict(depth);
  const lzw = new LzwWriter(dict);

  lzw.write(dict.bof);

  if (pixels.length > 0) {
    let code = pixels[0];

    const { length } = pixels;

    for (let i = 1; i < length; i++) {
      const pixelIndex = pixels[i];
      const nextCode = dict.get(code, pixelIndex);

      if (nextCode !== 0) {
        code = nextCode;
      } else {
        lzw.write(code);

        // Reset dict when full.
        if (!dict.add(code, pixelIndex)) {
          lzw.write(dict.bof);
          dict.reset();
        }

        code = pixelIndex;
      }
    }

    lzw.write(code);
  }

  lzw.write(dict.eof);

  lzw.pipe(stream);
}
