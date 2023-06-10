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
      const pixel = pixels[i];
      const newCode = dict.codeAfterAppend(code, pixel);

      if (newCode != null) {
        code = newCode;
      } else {
        buffer.write(code);
        dict.add(code, pixel);

        code = pixel;
      }
    }

    buffer.write(code);
  }

  buffer.write(dict.eof);

  buffer.pipe(stream);
}
