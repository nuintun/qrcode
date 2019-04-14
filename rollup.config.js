// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'example/index.es.js',
  output: {
    format: 'iife',
    file: 'example/bundle.js'
  },
  plugins: [resolve()]
};
