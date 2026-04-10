/**
 * @module interface
 * @description Rspack 构建配置的类型定义模块，提供应用配置的接口和工具类型
 */

import type { Configuration, Mode } from '@rspack/core';

/**
 * @typedef Env
 * @description 环境变量配置对象类型，键值对形式存储自定义环境变量
 */
export type Env = Record<string, unknown>;

/**
 * @interface EnvFunction
 * @description 动态环境变量配置函数接口，用于根据打包模式和系统环境变量生成配置
 */
export interface EnvFunction {
  /**
   * @param mode 打包模式，如 'development'、'production'
   * @param env 当前进程的环境变量对象（process.env）
   */
  (mode: Mode, env: Env): Env | Promise<Env>;
}

/**
 * @type GetProp
 * @description 工具类型：获取对象指定属性的非空类型
 */
export type GetProp<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @typedef Props
 * @description 从 Rspack Configuration 中 pick 的属性键名集合
 */
type Props = 'context' | 'plugins' | 'externals' | 'externalsType';

/**
 * @interface AppConfig
 * @description 应用配置接口，定义了 rspack-antd-builder 的项目配置结构
 */
export interface AppConfig extends Pick<Configuration, Props> {
  /**
   * @property lang
   * @description HTML 文档的语言属性值，如 'zh-CN'、'en-US'
   */
  lang: string;
  /**
   * @property name
   * @description 应用名称，用于注入到环境变量 __APP_NAME__ 中
   */
  name: string;
  /**
   * @property favicon
   * @description 网站图标文件路径
   */
  favicon: string;
  /**
   * @property entryHTML
   * @description HTML 模板文件路径，作为页面入口模板
   */
  entryHTML: string;
  /**
   * @property env
   * @description 可选的环境变量配置，可以是静态对象或动态生成函数
   */
  env?: Env | EnvFunction;
  /**
   * @property meta
   * @description HTML 页面的 meta 标签配置，键值对形式
   */
  meta?: Record<string, string>;
  /**
   * @property entry
   * @description 应用入口文件配置，指定打包的起始文件
   * @see https://rspack.dev/config/entry
   */
  entry: GetProp<Configuration, 'entry'>;
  /**
   * @property ports
   * @description 开发服务器端口配置
   */
  ports: number | [start: number, end?: number];
  /**
   * @property alias
   * @description 模块解析别名配置，简化导入路径
   */
  alias?: GetProp<GetProp<Configuration, 'resolve'>, 'alias'>;
  /**
   * @property outputPath
   * @description 构建输出目录的绝对路径
   */
  outputPath: GetProp<GetProp<Configuration, 'output'>, 'path'>;
  /**
   * @property publicPath
   * @description 资源的公共访问路径，默认为 '/'
   */
  publicPath?: GetProp<GetProp<Configuration, 'output'>, 'publicPath'>;
}

/**
 * @function defineConfig
 * @description 定义应用配置的辅助函数，提供类型推断和智能提示
 * @param config 应用配置对象，必须符合 AppConfig 接口规范
 */
export function defineConfig(config: AppConfig): AppConfig {
  return config;
}
