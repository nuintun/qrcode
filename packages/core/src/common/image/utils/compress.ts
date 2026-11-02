/**
 * @module index
 */

import { Dict } from './Dict';
import { GifWriter } from './GifWriter';
import { LzwWriter } from './LzwWriter';

/**
 * LZW-compresses a scaled image with an optional unscaled margin.
 */
export function compress(
  pixels: Uint8Array,
  width: number,
  height: number,
  depth: number,
  scale: number,
  margin: number,
  stream: GifWriter
): void {
  let code = -1;

  const dict = new Dict(depth);
  const lzw = new LzwWriter(dict, stream);
  const outputWidth = width * scale + margin * 2;

  const writePixel = (index: number): void => {
    if (code < 0) {
      code = index;
    } else {
      const nextCode = dict.get(code, index);

      if (nextCode !== 0) {
        code = nextCode;
      } else {
        lzw.write(code);

        if (!dict.add(code, index)) {
          lzw.write(dict.bof);

          dict.reset();
        }

        code = index;
      }
    }
  };

  const writeMargin = (width: number, height: number): void => {
    const length = width * height;

    for (let i = 0; i < length; i++) {
      writePixel(0);
    }
  };

  lzw.write(dict.bof);

  // Top margin.
  writeMargin(outputWidth, margin);

  // Image rows.
  for (let y = 0; y < height; y++) {
    const offset = y * width;

    for (let repeatY = 0; repeatY < scale; repeatY++) {
      // Left margin.
      writeMargin(margin, 1);

      // Scaled source row.
      for (let x = 0; x < width; x++) {
        const index = pixels[offset + x];

        for (let repeatX = 0; repeatX < scale; repeatX++) {
          writePixel(index);
        }
      }

      // Right margin.
      writeMargin(margin, 1);
    }
  }

  // Bottom margin.
  writeMargin(outputWidth, margin);

  if (code >= 0) {
    lzw.write(code);
  }

  lzw.write(dict.eof);

  lzw.finish();
}
