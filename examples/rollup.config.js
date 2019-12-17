/**
 * @module rollup.config
 * @license MIT
 * @author nuintun
 */

import del from 'del';
import resolve from '@rollup/plugin-node-resolve';

del.sync(['examples/qrcode.js'], { force: true });

export default {
  input: 'esnext/index.js',
  output: {
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
