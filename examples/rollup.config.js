/**
 * @module rollup.config
 * @license MIT
 * @author nuintun
 */

import rimraf from 'rimraf';
const pkg = require('../package.json');
import resolve from '@rollup/plugin-node-resolve';

const banner = `/**
 * @module QRCode
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

rimraf.sync('examples/qrcode.js');

export default {
  input: 'esnext/index.js',
  output: {
    banner,
    format: 'umd',
    name: 'QRCode',
    esModule: false,
    amd: { id: 'qrcode' },
    file: 'examples/qrcode.js'
  },
  plugins: [resolve()],
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  }
};
