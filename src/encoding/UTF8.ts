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
  let pos: number = 0;

  const bytes: number[] = [];
  const length: number = text.length;

  for (let i: number = 0; i < length; i++) {
    let code: number = text.charCodeAt(i);

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
  let pos: number = 0;
  let output: string = '';

  const length: number = bytes.length;

  while (pos < length) {
    const c1: number = bytes[pos++];

    if (c1 < 128) {
      output += String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      const c2: number = bytes[pos++];

      output += String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
    } else if (c1 > 239 && c1 < 365) {
      // Surrogate Pair
      const c2: number = bytes[pos++];
      const c3: number = bytes[pos++];
      const c4: number = bytes[pos++];
      const u: number = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;

      output += String.fromCharCode(0xd800 + (u >> 10));
      output += String.fromCharCode(0xdc00 + (u & 1023));
    } else {
      const c2: number = bytes[pos++];
      const c3: number = bytes[pos++];

      output += String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
    }
  }

  return output;
}
