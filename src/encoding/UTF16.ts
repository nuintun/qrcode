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
  const bytes: number[] = [];
  const length: number = text.length;

  for (let i: number = 0; i < length; i++) {
    bytes.push(text.charCodeAt(i));
  }

  return bytes;
}
