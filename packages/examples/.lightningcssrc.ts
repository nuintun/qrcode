/**
 * @module .lightningcssrc
 * @description LightningCSS 配置模块，用于生成 CSS 转换和优化的配置选项
 */

import { targets } from './tools/index.ts';
import type { Mode } from './tools/index.ts';
import type { LightningcssLoaderOptions } from '@rspack/core';

/**
 * @function lightningcssrc
 * @description 根据打包模式生成 LightningCSS Loader 的配置选项
 * @param mode 打包模式，'development' 或 'production'
 * @see https://lightningcss.dev
 */
export default async function (mode: Mode): Promise<LightningcssLoaderOptions> {
  return {
    // 从 browserslist 配置中解析目标浏览器，用于 CSS 特性转换
    targets: await targets(),
    // 开发模式启用错误恢复，生产模式严格检查
    errorRecovery: mode !== 'production'
  };
}
