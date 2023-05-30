/**
 * @module utils
 */

const { toString } = Object.prototype;

export function toUInt32(uint32: number): number {
  // 防止溢出 0-0xffffffff
  return uint32 >>> 0;
}

export function isNumber(value: unknown): value is number {
  return toString.call(value) === '[object Number]';
}
