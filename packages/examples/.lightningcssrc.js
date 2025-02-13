/**
 * @module .lightningcssrc
 * @description Lightningcss 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @function postcssrc
 * @param {string} mode
 * @return {Promise<import('@rspack/core').LightningcssLoaderOptions>}
 */
export default async mode => {
  return {
    targets: await targets(),
    errorRecovery: mode !== 'production'
  };
};
