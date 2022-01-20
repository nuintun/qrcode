/**
 * @module rollup.examples
 */

import pkg from '../package.json';
import treeShake from './plugins/tree-shake';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const banner = `/**
 * @module QRCode
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name}
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

export default {
  input: 'src/index.ts',
  output: {
    banner,
    format: 'umd',
    name: 'QRCode',
    interop: false,
    esModule: false,
    amd: { id: 'qrcode' },
    file: 'examples/qrcode.js'
  },
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  },
  plugins: [resolve(), typescript(), treeShake()]
};
