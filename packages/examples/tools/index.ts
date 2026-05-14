/**
 * @module interface
 * @description Rspack 构建配置的类型定义模块，提供应用配置的接口和工具类型
 */

import targets from './utils/targets.ts';
import { isFunction } from './utils/typeof.ts';
import type { AppConfig, AppConfigFactory, Mode } from './utils/types.ts';

// 导出 targets 解析函数
export { targets };

// 导出 AppConfig, Mode 类型定义
export type { AppConfig, Mode };

/**
 * @function defineConfig
 * @description 定义应用配置的辅助函数，提供类型推断和智能提示
 * @param config 应用配置对象，必须符合 AppConfig 接口规范
 */
export function defineConfig(config: AppConfig | AppConfigFactory): AppConfigFactory {
  return isFunction(config) ? config : () => config;
}
