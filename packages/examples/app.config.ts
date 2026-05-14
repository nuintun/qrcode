/**
 * @module app.config
 * @description 应用构建配置文件，定义打包规则的项目级配置
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';
import { defineConfig } from './tools/index.ts';

const app = resolve('app');
const js = resolve('app/js');
const css = resolve('app/css');
const images = resolve('app/images');
const html = resolve('wwwroot/index.html');

// 生成配置文件
export default defineConfig({
  ports: 8000,
  roots: [app],
  context: app,
  name: '二维码',
  lang: 'zh-CN',
  alias: {
    '/js': js,
    '/css': css,
    '/images': images
  },
  historyApiFallback: html,
  publicPath: '/qrcode/public/',
  outputPath: resolve('wwwroot/public'),
  entry: resolve('app/js/pages/index.tsx'),
  pages: {
    filename: html,
    favicon: resolve('app/images/favicon.ico'),
    meta: {
      viewport: 'width=device-width,initial-scale=1.0'
    }
  },
  plugins: [
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: 'images/qrcode.jpg',
          to: 'images/qrcode.jpg'
        }
      ]
    })
  ]
});
