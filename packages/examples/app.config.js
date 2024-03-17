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
  name: '二维码',
  lang: 'zh-CN',
  context: path.resolve('src'),
  entry: [path.resolve('src/js/index.tsx')],
  outputPath: path.resolve('static/public'),
  entryHTML: path.resolve('static/index.html'),
  favicon: path.resolve('src/images/favicon.ico'),
  alias: { '/js': js, '/css': css, '/images': images },
  publicPath: '/qrcode/packages/examples/static/public',
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};
