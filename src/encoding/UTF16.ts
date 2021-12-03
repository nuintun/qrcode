/**
 * @module UTF16
 * @author nuintun
 */

/**
 * @function encode
 * @param {string} text
 * @returns {number[]}
 */
export function encode(text: string): number[] {
  const { length } = text;
  const bytes: number[] = [];

  for (let i = 0; i < length; i++) {
    bytes.push(text.charCodeAt(i));
  }

  return bytes;
}
