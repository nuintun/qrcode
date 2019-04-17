// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'esnext/index.js',
  output: {
    format: 'umd',
    name: 'QRCode',
    amd: { id: 'qrcode' },
    file: 'example/bundle.js'
  },
  plugins: [resolve()],
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  }
};
