/**
 * @module UTF8
 * @author nuintun
 */

/**
 * @function UTF8
 * @param str
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
 */
export default function UTF8(str: string): number[] {
  let pos: number = 0;
  const output: number[] = [];

  for (let i: number = 0; i < str.length; i++) {
    let code: number = str.charCodeAt(i);

    if (code < 128) {
      output[pos++] = code;
    } else if (code < 2048) {
      output[pos++] = (code >> 6) | 192;
      output[pos++] = (code & 63) | 128;
    } else if ((code & 0xfc00) == 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) == 0xdc00) {
      // Surrogate Pair
      code = 0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);

      output[pos++] = (code >> 18) | 240;
      output[pos++] = ((code >> 12) & 63) | 128;
      output[pos++] = ((code >> 6) & 63) | 128;
      output[pos++] = (code & 63) | 128;
    } else {
      output[pos++] = (code >> 12) | 224;
      output[pos++] = ((code >> 6) & 63) | 128;
      output[pos++] = (code & 63) | 128;
    }
  }

  return output;
}
