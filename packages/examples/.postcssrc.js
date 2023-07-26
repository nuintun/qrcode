/**
 * @module .postcssrc
 * @description PostCSS 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @function postcssrc
 * @param {string} mode
 * @return {Promise<import('./tools/interface').PostcssConfig>}
 */
export default async mode => {
  return {
    sourceMap: mode !== 'production',
    plugins: [['autoprefixer', { flexbox: 'no-2009', env: await targets() }]]
  };
};
