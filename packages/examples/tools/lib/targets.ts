/**
 * @module targets
 * @description Browserslist 配置解析模块，用于读取和解析浏览器兼容性目标配置
 */

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';

/**
 * @constant defaultConfig
 * @description 默认的 browserslist 配置文件路径（.browserslistrc）
 */
const defaultConfig = resolve('.browserslistrc');

/**
 * @function parse
 * @description 异步解析 browserslist 配置文件，提取浏览器查询字符串数组
 * @param path 配置文件路径，默认为项目根目录下的 .browserslistrc 文件
 * @see https://github.com/browserslist/browserslist#queries
 */
export default async function (path = defaultConfig): Promise<string[]> {
  // 读取配置文件内容
  const code = await readFile(path);

  return (
    code
      .toString()
      // 移除注释：删除 # 开头到行尾的所有内容
      .replace(/#[^\r\n]*/g, '')
      // 按换行符、逗号或连续空白字符分割
      .split(/\s*[\r\n,]+\s*/)
      // 过滤掉空字符串和纯空白字符串
      .filter(query => query)
  );
}
