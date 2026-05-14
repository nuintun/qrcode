/**
 * @module env
 * @description 环境变量处理模块，负责解析和转换构建时的环境变量
 */

import type { Mode } from '@rspack/core';
import type { AppConfig } from './types.ts';

/**
 * @function resolveEnvironment
 * @description 解析并标准化环境变量，将其转换为适合注入到构建环境的格式
 * @param mode 打包模式，如 'development'、'production' 等
 * @param config 完整的应用配置对象
 */
export async function resolveEnvironment(mode: Mode, config: AppConfig) {
  // 合并默认环境变量：应用名称和开发模式标识
  const env = {
    ...config.env,
    __APP_NAME__: config.name,
    __DEV__: mode !== 'production'
  };

  // 遍历所有环境变量，将值序列化为 JSON 字符串
  const entries = Object.entries(env);
  const output: Record<string, string> = {};

  for (const [key, value] of entries) {
    // JSON.stringify 确保字符串类型值带有引号，数字/布尔值保持正确格式
    output[key] = JSON.stringify(value);
  }

  return output;
}
