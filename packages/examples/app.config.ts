/**
 * @module app.config
 * @description 应用构建配置文件，定义打包规则的项目级配置
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';
import { defineConfig } from './tools/index.ts';

const js = resolve('app/js');
const css = resolve('app/css');
const images = resolve('app/images');

// 生成配置文件
export default defineConfig({
  ports: 8000,
  name: '二维码',
  lang: 'zh-CN',
  context: resolve('app'),
  publicPath: '/qrcode/public/',
  outputPath: resolve('wwwroot/public'),
  entry: resolve('app/js/pages/index.tsx'),
  entryHTML: resolve('wwwroot/index.html'),
  favicon: resolve('app/images/favicon.ico'),
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' },
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
