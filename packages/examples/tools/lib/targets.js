/**
 * @module targets
 * @description 解析 browserslist 配置
 */

import { readFile } from 'fs';
import { resolve } from 'path';

// 默认配置
const defaultConfig = resolve('.browserslistrc');

/**
 * @function parse
 * @param {string} path
 * @return {Array}
 */
export default (path = defaultConfig) => {
  return new Promise((resolve, reject) => {
    readFile(path, { encoding: 'utf-8' }, async (error, code) => {
      if (error) {
        reject(error);
      } else {
        resolve(
          code
            .replace(/#[^\n]*/g, '')
            .split(/\s*[\r\n,]\s*/)
            .filter(query => query)
        );
      }
    });
  });
};
