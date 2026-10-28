/**
 * @module utils
 */

/**
 * @function createMarkup
 * @description 生成 React HTML 字符串
 * @param html HTML 字符串
 */
export function createMarkup(html: string): { __html: string } {
  return { __html: html };
}

/**
 * @function normalizeLinefeed
 * @description 格式化换行
 * @param value 需要格式化的字符串
 */
export function normalizeLinefeed(value: string): string {
  return value.replace(/\r(?!\n)|\r\n/g, '\n');
}
