/**
 * @module .swcrc
 * @description SWC 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @function swcrc
 * @return {Promise<import('./tools/interface').SwcConfig>}
 */
export default async () => {
  return {
    jsc: {
      externalHelpers: true,
      parser: {
        tsx: true,
        syntax: 'typescript'
      },
      transform: {
        react: {
          runtime: 'automatic'
        }
      }
    },
    env: {
      targets: await targets()
    }
  };
};
