/**
 * @module rollup.examples
 */

import { createRequire } from 'module';
import treeShake from './plugins/tree-shake.js';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const pkg = createRequire(import.meta.url)('../package.json');

const banner = `/**
 * @module QRCode
 * @package ${pkg.name}
 * @license ${pkg.license}
 * @version ${pkg.version}
 * @author ${pkg.author.name} <${pkg.author.email}>
 * @description ${pkg.description}
 * @see ${pkg.homepage}
 */
`;

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: {
    banner,
    format: 'umd',
    name: 'QRCode',
    interop: 'auto',
    exports: 'auto',
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
