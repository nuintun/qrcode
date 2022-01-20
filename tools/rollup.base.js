/**
 * @module rollup.base
 */

import treeShake from './plugins/tree-shake';
import typescript from '@rollup/plugin-typescript';

export default function rollup(esnext) {
  return {
    input: 'src/index.ts',
    output: {
      interop: false,
      esModule: false,
      dir: esnext ? 'esm' : 'cjs',
      format: esnext ? 'esm' : 'cjs'
    },
    external: ['tslib'],
    preserveModules: true,
    plugins: [typescript(), treeShake()],
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    }
  };
}
