/**
 * @module rollup.base
 */

import { isBuiltin } from 'node:module';
import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import pkg from '../package.json' with { type: 'json' };

const externals = [
  // @ts-ignore
  // dependencies
  ...Object.keys(pkg.dependencies ?? {}),
  // @ts-ignore
  // peer dependencies
  ...Object.keys(pkg.peerDependencies ?? {})
];

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
 * @function rollup
 * @description rollup configuration
 * @param {boolean} [esnext] is esnext
 */
export default function rollup(esnext = false): RollupOptions {
  return {
    input: 'src/index.ts',
    output: {
      banner,
      esModule: false,
      interop: 'auto',
      exports: 'named',
      preserveModules: true,
      dir: esnext ? 'esm' : 'cjs',
      format: esnext ? 'esm' : 'cjs',
      generatedCode: { constBindings: true },
      entryFileNames: `[name].${esnext ? 'js' : 'cjs'}`,
      chunkFileNames: `[name].${esnext ? 'js' : 'cjs'}`
    },
    plugins: [
      typescript({
        rootDir: 'src',
        declaration: true,
        declarationDir: esnext ? 'esm' : 'cjs'
      })
    ],
    onwarn(error, warn) {
      if (error.code !== 'CIRCULAR_DEPENDENCY') {
        warn(error);
      }
    },
    external(source) {
      if (isBuiltin(source)) {
        return true;
      }

      for (const external of externals) {
        if (source === external || source.startsWith(`${external}/`)) {
          return true;
        }
      }

      return false;
    }
  };
}
