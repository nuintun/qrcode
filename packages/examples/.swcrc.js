/**
 * @module .swcrc
 * @description Swc 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @function swcrc
 * @param {string} mode
 * @return {Promise<import('@rspack/core').SwcLoaderOptions>}
 */
export default async mode => {
  return {
    jsc: {
      externalHelpers: true,
      parser: {
        tsx: true,
        syntax: 'typescript'
      },
      transform: {
        react: {
          runtime: 'automatic',
          refresh: mode !== 'production'
        }
      }
    },
    env: {
      targets: await targets()
    }
  };
};
