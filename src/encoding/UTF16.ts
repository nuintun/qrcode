/**
 * @module UTF16
 * @author nuintun
 */

export default function UTF16(str: string): number[] {
  const bytes: number[] = [];
  const length: number = str.length;

  for (let i: number = 0; i < length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}
