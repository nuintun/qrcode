/**
 * @module interface
 * @description 类型定义
 */

import { Configuration } from 'webpack';
import { Options } from 'webpack-dev-service';
import { Plugin, ProcessOptions } from 'postcss';
import { Options as SvgoOptions } from '@nuintun/svgo-loader';

/**
 * @description Env 配置
 */
type Env = Record<string, unknown>;

/**
 * @description 获取对象指定属性非空类型
 */
type Prop<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @description Env 配置函数
 */
type EnvFunction = (isDevelopment: boolean, env: Env) => Env | Promise<Env>;

/**
 * @description Swc 配置
 */
export { Options as SwcConfig } from '@swc/core';

/**
 * @description Postcss 配置
 */
export interface PostcssConfig extends ProcessOptions {
  plugins?: Plugin[];
  sourceMap?: boolean;
}

/**
 * @description Svgo 配置
 */
export interface SvgoConfig extends Omit<SvgoOptions, 'configFile'> {
  path?: string;
}

/**
 * @description Webpack 文件系统
 */
export type OutputFileSystem = NonNullable<Options['outputFileSystem']>;

/**
 * @description App 配置
 */
export interface AppConfig extends Pick<Configuration, 'context' | 'plugins' | 'externals'> {
  lang: string;
  name: string;
  favicon: string;
  entryHTML: string;
  outputPath: string;
  publicPath?: string;
  env?: Env | EnvFunction;
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  ports: [start: number, end?: number];
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
}
