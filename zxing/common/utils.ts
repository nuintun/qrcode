/**
 * @module utils
 */

const { toString } = Object.prototype;

export function isNumber(value: unknown): value is number {
  return toString.call(value) === '[object Number]';
}
