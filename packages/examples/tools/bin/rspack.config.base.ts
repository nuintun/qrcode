/**
 * @module rspack.config.base
 * @description 基础 Rspack 配置
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';
import { scanFiles } from '../lib/fs.ts';
import resolveRules from '../lib/rules.ts';
import appConfig from '../../app.config.ts';
import { resolveEnvironment } from '../lib/env.ts';
import type { Configuration, Mode } from '@rspack/core';

/**
 * @function rspackrc
 * @description 生成 Rspack 配置
 * @param mode 打包模式
 */
export default async function (mode: Mode): Promise<Configuration> {
  const isDevelopment = mode !== 'production';

  const html = {
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    favicon: appConfig.favicon,
    filename: appConfig.entryHTML,
    template: resolve('tools/lib/template.ejs'),
    templateParameters: { lang: appConfig.lang }
  };

  const env = await resolveEnvironment(mode, appConfig.env);

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  const progress = {
    progressChars: '█▒',
    prefix: appConfig.name,
    template: '<i> {prefix:.cyan.bold} {bar:25.green/white.dim} ({percent}%) {wide_msg:.dim}'
  };

  return {
    mode,
    cache: true,
    performance: false,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      cssFilename: css.filename,
      path: appConfig.outputPath,
      publicPath: appConfig.publicPath,
      cssChunkFilename: css.chunkFilename,
      filename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    module: {
      rules: await resolveRules(mode)
    },
    resolve: {
      alias: appConfig.alias,
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: [
      new rspack.ProgressPlugin(progress),
      new rspack.CaseSensitivePlugin(),
      new rspack.DefinePlugin(env),
      new rspack.CssExtractRspackPlugin(css),
      new rspack.HtmlRspackPlugin(html),
      ...(appConfig.plugins ?? [])
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        maxSize: 512 * 1024
      },
      runtimeChunk: 'single',
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true
    },
    stats: {
      all: false,
      assets: true,
      colors: true,
      errors: true,
      timings: true,
      version: true,
      warnings: true,
      errorsCount: true,
      warningsCount: true,
      groupAssetsByPath: true
    },
    externals: appConfig.externals,
    externalsType: appConfig.externalsType,
    experiments: {
      cache: {
        type: 'persistent',
        buildDependencies: [
          resolve('.swcrc.ts'),
          resolve('.svgorc.ts'),
          resolve('package.json'),
          resolve('app.config.ts'),
          resolve('.browserslistrc'),
          resolve('.lightningcssrc.ts'),
          ...(await scanFiles('tools'))
        ],
        storage: {
          type: 'filesystem',
          directory: resolve('node_modules/.cache/rspack')
        }
      }
    }
  };
}
