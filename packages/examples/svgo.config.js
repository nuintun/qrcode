/**
 * @module svgo.config
 * @description Svgo 配置
 */

import { createHash } from 'node:crypto';

/**
 * @type {import('./tools/interface').SvgoConfig}
 */
export default {
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
