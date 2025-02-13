/**
 * @module interface
 * @description 类型定义
 */

import type { Configuration } from '@rspack/core';
import type { Options } from 'rspack-dev-middleware';

/**
 * @description Env 配置
 */
type Env = Record<string, unknown>;

/**
 * @description Env 配置函数
 */
interface EnvFunction {
  (mode: string, env: Env): Env | Promise<Env>;
}

/**
 * @description 获取对象指定属性非空类型
 */
type Prop<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @description Swc 和 Lightningcss 配置
 */
export {
  // Swc 配置
  SwcLoaderOptions as SwcConfig,
  // Lightningcss 配置
  LightningcssLoaderOptions as LightningcssConfig
} from '@rspack/core';

/**
 * @description Rspack 文件系统
 */
export type FileSystem = NonNullable<Options['fs']>;

/**
 * @description Svgo 配置
 */
export { SvgoOptions as SvgoConfig } from 'svgc-loader';

/**
 * @description App 配置
 */
export interface AppConfig extends Pick<Configuration, 'context' | 'plugins' | 'externals'> {
  lang: string;
  name: string;
  favicon: string;
  entryHTML: string;
  env?: Env | EnvFunction;
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  ports: [start: number, end?: number] | number;
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
  outputPath: Prop<Prop<Configuration, 'output'>, 'path'>;
  publicPath?: Prop<Prop<Configuration, 'output'>, 'publicPath'>;
}
