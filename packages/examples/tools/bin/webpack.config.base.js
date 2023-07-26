/**
 * @module webpack.config.base
 * @description 基础 Webpack 配置
 */

import webpack from 'webpack';
import { resolve } from 'path';
import resolveRules from '../lib/rules.js';
import appConfig from '../../app.config.js';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin';

/**
 * @function resolveEnvironment
 * @param {object} env
 * @param {boolean} isDevelopment
 * @return {Promise<object>}
 */
async function resolveEnvironment(env, isDevelopment) {
  if (typeof env === 'function') {
    env = await env(isDevelopment, process.env);
  }

  env = {
    ...env,
    __DEV__: isDevelopment,
    __APP_NAME__: appConfig.name
  };

  const output = {};
  const entries = Object.entries(env);

  for (const [key, value] of entries) {
    output[key] = JSON.stringify(value);
  }

  return output;
}

/**
 * @function webpackrc
 * @param {string} mode
 * @return {Promise<import('webpack').Configuration>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';

  const progress = {
    percentBy: 'entries'
  };

  const html = {
    xhtml: true,
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    favicon: appConfig.favicon,
    filename: appConfig.entryHTML,
    template: resolve('tools/lib/template.ejs'),
    templateParameters: { lang: appConfig.lang }
  };

  const env = await resolveEnvironment(appConfig.env, isDevelopment);

  const css = {
    ignoreOrder: true,
    filename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
    chunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`
  };

  const clean = {
    cleanOnceBeforeBuildPatterns: [appConfig.entryHTML, appConfig.outputPath]
  };

  return {
    mode,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      hashFunction: 'xxhash64',
      path: appConfig.outputPath,
      publicPath: appConfig.publicPath,
      filename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    externals: appConfig.externals,
    externalsType: appConfig.externalsType,
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [
          resolve('.swcrc.js'),
          resolve('package.json'),
          resolve('.postcssrc.js'),
          resolve('app.config.js'),
          resolve('.browserslistrc')
        ]
      }
    },
    stats: {
      colors: true,
      chunks: false,
      children: false,
      entrypoints: false,
      runtimeModules: false,
      dependentModules: false
    },
    performance: {
      hints: false
    },
    resolve: {
      alias: appConfig.alias,
      fallback: { url: false },
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
      strictExportPresence: true,
      rules: await resolveRules(mode)
    },
    plugins: [
      new webpack.ProgressPlugin(progress),
      new CaseSensitivePathsPlugin(),
      new CleanWebpackPlugin(clean),
      new webpack.DefinePlugin(env),
      new MiniCssExtractPlugin(css),
      new HtmlWebpackPlugin(html),
      ...(appConfig.plugins || [])
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      },
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true,
      runtimeChunk: {
        name: entrypoint => `runtime-${entrypoint.name}`
      }
    }
  };
};
