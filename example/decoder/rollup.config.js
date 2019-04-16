// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'example/decoder/index.js',
  output: {
    format: 'iife',
    file: 'example/decoder/bundle.js'
  },
  plugins: [resolve()],
  onwarn(error, warn) {
    if (error.code !== 'CIRCULAR_DEPENDENCY') {
      warn(error);
    }
  }
};
