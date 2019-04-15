/**
 * @module UTF8
 * @author nuintun
 */

/**
 * @function UTF8
 * @param {string} str
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
 */
export default function UTF8(str: string): number[] {
  let pos: number = 0;
  const bytes: number[] = [];

  for (let i: number = 0; i < str.length; i++) {
    let code: number = str.charCodeAt(i);

    if (code < 128) {
      bytes[pos++] = code;
    } else if (code < 2048) {
      bytes[pos++] = (code >> 6) | 192;
      bytes[pos++] = (code & 63) | 128;
    } else if ((code & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      // Surrogate Pair
      code = 0x10000 + ((code & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);

      bytes[pos++] = (code >> 18) | 240;
      bytes[pos++] = ((code >> 12) & 63) | 128;
      bytes[pos++] = ((code >> 6) & 63) | 128;
      bytes[pos++] = (code & 63) | 128;
    } else {
      bytes[pos++] = (code >> 12) | 224;
      bytes[pos++] = ((code >> 6) & 63) | 128;
      bytes[pos++] = (code & 63) | 128;
    }
  }

  return bytes;
}
