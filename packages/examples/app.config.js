/**
 * @module app.config
 * @description 应用配置
 */

import path from 'node:path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const js = path.resolve('app/js');
const css = path.resolve('app/css');
const images = path.resolve('app/images');

/**
 * @type {import('./tools/interface').AppConfig}
 */
export default {
  ports: 8000,
  name: '二维码',
  lang: 'zh-CN',
  context: path.resolve('app'),
  publicPath: '/qrcode/public/',
  outputPath: path.resolve('wwwroot/public'),
  entry: path.resolve('app/js/pages/index.tsx'),
  entryHTML: path.resolve('wwwroot/index.html'),
  favicon: path.resolve('app/images/favicon.ico'),
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' },
  plugins: [new CopyWebpackPlugin({ patterns: [{ from: 'images/qrcode.jpg', to: 'images/qrcode.jpg' }] })]
};
