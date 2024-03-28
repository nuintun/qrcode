/**
 * @module app.config
 * @description 应用配置
 */

import path from 'path';

const js = path.resolve('src/js');
const css = path.resolve('src/css');
const images = path.resolve('src/images');

/**
 * @type {import('./tools/interface').AppConfig}
 */
export default {
  ports: 8000,
  name: '二维码',
  lang: 'zh-CN',
  context: path.resolve('src'),
  outputPath: path.resolve('app/public'),
  entry: path.resolve('src/js/index.tsx'),
  entryHTML: path.resolve('app/index.html'),
  favicon: path.resolve('src/images/favicon.ico'),
  publicPath: '/qrcode/packages/examples/app/public/',
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};
