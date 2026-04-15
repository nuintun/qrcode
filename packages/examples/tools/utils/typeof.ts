/**
 * @module typeof
 * @description 类型判断工具模块，提供类型守卫函数
 */

const { toString } = Object.prototype;

/**
 * @function isBoolean
 * @description 判断给定值是否为布尔类型，作为 TypeScript 类型守卫使用
 * @param value 需要判断类型的任意值
 */
export function isBoolean(value: unknown): value is boolean {
  return toString.call(value) === '[object Boolean]';
}

/**
 * @function isFunction
 * @description 判断给定值是否为函数类型，作为 TypeScript 类型守卫使用
 * @param value 需要判断类型的任意值
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}
