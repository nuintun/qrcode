/**
 * @module .svgorc
 * @description Svgo 配置
 */

import { createHash } from 'node:crypto';

/**
 * @function svgorc
 * @param {string} mode
 * @return {Promise<import('./tools/interface').SvgoConfig>}
 */
export default async mode => {
  return {
    multipass: mode === 'production',
    plugins: [
      'preset-default',
      {
        name: 'prefixIds',
        params: {
          delim: '-',
          prefix(_xast, { path }) {
            const hash = createHash('sha1');

            return hash.update(path).digest('hex').slice(0, 8);
          }
        }
      }
    ]
  };
};
