/**
 * @module types
 */

import type { Configuration, HtmlRspackPluginOptions, Mode } from '@rspack/core';

/**
 * @typedef Mode
 * @description 打包模式类型，可以是 'development' 或 'production' 等
 */
export type { Mode };

/**
 * @typedef Env
 * @description 环境变量配置对象类型，键值对形式存储自定义环境变量
 */
export type Env = Record<string, unknown>;

/**
 * @typedef PageConfig
 * @description 页面配置类型，继承自 HtmlRspackPluginOptions，用于配置单个 HTML 页面的生成选项
 */
export type PageConfig = HtmlRspackPluginOptions;

/**
 * @typedef AppConfigFactory
 * @description 应用配置工厂函数类型，根据打包模式动态生成应用配置
 */
export type AppConfigFactory = (mode: Mode) => AppConfig;

/**
 * @type GetProp
 * @description 工具类型：获取对象指定属性的非空类型
 */
export type GetProp<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @interface AppConfig
 * @description 应用配置接口，定义了 rspack-antd-builder 的项目配置结构
 */
export interface AppConfig extends Pick<
  Configuration,
  // 从 Rspack Configuration 中 pick 的属性键名集合
  'context' | 'plugins' | 'externals' | 'externalsType'
> {
  /**
   * @property env
   * @description 可选的环境变量配置，可以是静态对象或动态生成函数
   */
  env?: Env;
  /**
   * @property name
   * @description 应用名称，用于注入到环境变量 __APP_NAME__ 和 HTML <title> 中
   */
  name: string;
  /**
   * @property lang
   * @description HTML 文档的语言属性值，如 'zh-CN'、'en-US' 等
   */
  lang: string;
  /**
   * @property entry
   * @description 应用入口配置，支持单入口字符串或多入口对象
   * @see https://rspack.dev/config/entry
   */
  entry: GetProp<Configuration, 'entry'>;
  /**
   * @property ports
   * @description 开发服务器端口配置
   */
  ports: number | [start: number, end?: number];
  /**
   * @property pages
   * @description  页面应用配置列表，支持单页面和多页面配置
   * @see https://rspack.rs/plugins/rspack/html-rspack-plugin
   */
  pages: PageConfig | [PageConfig, ...PageConfig[]];
  /**
   * @property historyApiFallback
   * @description History API 回退配置，当请求未匹配到静态资源时返回 HTML 入口文件
   */
  historyApiFallback?: string | ((path: string) => string);
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
