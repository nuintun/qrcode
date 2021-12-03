/**
 * @module UTF8
 * @author nuintun
 */

/**
 * @function encode
 * @param {string} text
 * @returns {number[]}
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
 */
export function encode(text: string): number[] {
  let pos = 0;

  const { length } = text;
  const bytes: number[] = [];

  for (let i = 0; i < length; i++) {
    let code = text.charCodeAt(i);

    if (code < 128) {
      bytes[pos++] = code;
    } else if (code < 2048) {
      bytes[pos++] = (code >> 6) | 192;
      bytes[pos++] = (code & 63) | 128;
    } else if ((code & 0xfc00) === 0xd800 && i + 1 < length && (text.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      // Surrogate Pair
      code = 0x10000 + ((code & 0x03ff) << 10) + (text.charCodeAt(++i) & 0x03ff);

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

/**
 * @function decode
 * @param {number[]} bytes
 * @returns {string}
 * @see https://github.com/google/closure-library/blob/master/closure/goog/crypt/crypt.js
 */
export function decode(bytes: number[]): string {
  let pos = 0;
  let output = '';

  const { length } = bytes;
  const { fromCharCode } = String;

  while (pos < length) {
    const c1 = bytes[pos++];

    if (c1 < 128) {
      output += fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2 = bytes[pos++];

      output += fromCharCode(((c1 & 31) << 6) | (c2 & 63));
    } else if (c1 > 239 && c1 < 365) {
      // Surrogate Pair
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];
      const c4 = bytes[pos++];
      const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;

      output += fromCharCode(0xd800 + (u >> 10));
      output += fromCharCode(0xdc00 + (u & 1023));
    } else {
      const c2 = bytes[pos++];
      const c3 = bytes[pos++];

      output += fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    }
  }

  return output;
}
