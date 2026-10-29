/**
 * @module index
 */

import { Dict } from './Dict';
import { GifWriter } from './GifWriter';
import { LzwWriter } from './LzwWriter';

export { GifWriter };

/** Populates `buffer` with the pixel values (< 2 ^ depth) of row `row`. */
export interface ReadRow {
  (row: number, buffer: Uint8Array): void;
}

/**
 * LZW-compresses a `width × height` image into GIF minimum-code-size data
 * sub-blocks on `stream`. Rows are pulled one by one from `readRow` (pixel
 * values < 2 ^ depth) into a reusable row buffer, so no full pixel buffer is
 * materialized. The dictionary starts at `depth + 1` bits, grows up to 12
 * bits and emits a clear code when full.
 */
export function compress(width: number, height: number, depth: number, stream: GifWriter, readRow: ReadRow): void {
  // -1 means no pixel has been read yet.
  let code = -1;

  const dict = new Dict(depth);
  const buffer = new Uint8Array(width);
  const lzw = new LzwWriter(dict, stream);

  lzw.write(dict.bof);

  for (let row = 0; row < height; row++) {
    buffer.fill(0);

    readRow(row, buffer);

    for (let col = 0; col < width; col++) {
      const index = buffer[col];

      if (code < 0) {
        code = index;

        continue;
      }

      const nextCode = dict.get(code, index);

      if (nextCode !== 0) {
        code = nextCode;
      } else {
        lzw.write(code);

        // Reset dict when full.
        if (!dict.add(code, index)) {
          lzw.write(dict.bof);
          dict.reset();
        }

        code = index;
      }
    }
  }

  if (code >= 0) {
    lzw.write(code);
  }

  lzw.write(dict.eof);
  lzw.finish();
}
