/**
 * @module app.config
 * @description 应用配置
 */

import path from 'path';

const js = path.resolve('app/js');
const css = path.resolve('app/css');
const images = path.resolve('app/images');

/**
 * @type {import('./tools/interface').AppConfig}
 */
export default {
  name: '二维码',
  lang: 'zh-CN',
  publicPath: 'public',
  context: path.resolve('app'),
  outputPath: path.resolve('public'),
  entryHTML: path.resolve('app.html'),
  entry: [path.resolve('app/js/index.tsx')],
  favicon: path.resolve('app/images/favicon.ico'),
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};
