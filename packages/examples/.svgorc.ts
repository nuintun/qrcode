/**
 * @module .svgorc
 * @description SVGO 配置模块，用于生成 SVG 图像优化的配置选项
 */

import type { Config } from 'svgo';
import type { Mode } from '@rspack/core';
import { createHash } from 'node:crypto';

/**
 * @function svgorc
 * @description 根据打包模式生成 SVGO（SVG Optimizer）的配置选项
 * @param mode 打包模式，'development' 或 'production'
 * @see https://github.com/svg/svgo
 */
export default async function (mode: Mode): Promise<Config> {
  return {
    multipass: mode === 'production',
    plugins: [
      'preset-default',
      'removeTitle',
      {
        name: 'prefixIds',
        params: {
          delim: '-',
          prefix(_xast, { path = '' }) {
            // 创建 SHA1 哈希实例
            const hash = createHash('sha1');

            // 使用文件路径生成哈希，并截取前 8 位作为唯一前缀
            return hash.update(path).digest('hex').slice(0, 8);
          }
        }
      }
    ]
  };
}
