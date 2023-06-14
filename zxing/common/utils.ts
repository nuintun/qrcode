/**
 * @module utils
 */

const { toString } = Object.prototype;

function typeOf(value: unknown, type: string): boolean {
  return toString.call(value) === `[object ${type}]`;
}

export function isString(value: unknown): value is string {
  return typeOf(value, 'String');
}
