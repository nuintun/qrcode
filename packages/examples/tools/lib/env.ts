/**
 * @module env
 * @description 环境变量处理模块，负责解析和转换构建时的环境变量
 */

import type { Mode } from '@rspack/core';
import appConfig from '../../app.config.ts';
import type { Env, EnvFunction } from '../index.ts';

/**
 * @function resolveEnvironment
 * @description 解析并标准化环境变量，将其转换为适合注入到构建环境的格式
 * @param mode 打包模式，如 'development'、'production' 等
 * @param env 可选的环境变量配置，可以是对象或返回对象的异步函数
 */
export async function resolveEnvironment(mode: Mode, env?: Env | EnvFunction) {
  // 如果 env 是函数，则调用它并传入模式和当前进程环境变量
  if (typeof env === 'function') {
    env = await env(mode, process.env);
  }

  // 合并默认环境变量：应用名称和开发模式标识
  env = {
    ...env,
    __APP_NAME__: appConfig.name,
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
