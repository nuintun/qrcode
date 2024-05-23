/**
 * @module targets
 * @description 解析 browserslist 配置
 */

import { resolve } from 'path';
import { readFile } from 'fs/promises';

// 默认配置
const defaultConfig = resolve('.browserslistrc');

/**
 * @function parse
 * @param {string} path
 * @return {Promise<Array>}
 */
export default async (path = defaultConfig) => {
  const code = await readFile(path);

  return code
    .toString()
    .replace(/#[^\r\n]*/g, '')
    .split(/\s*[\r\n,]+\s*/)
    .filter(query => query);
};
