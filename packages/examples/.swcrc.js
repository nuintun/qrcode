/**
 * @module .swcrc
 * @description SWC 配置
 */

import { resolve } from 'path';
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
      },
      experimental: {
        cacheRoot: resolve('node_modules/.cache/swc')
      }
    },
    env: {
      targets: await targets()
    }
  };
};
