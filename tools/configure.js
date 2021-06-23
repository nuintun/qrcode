/**
 * @module configure
 * @license MIT
 * @author nuintun
 */

import MagicString from 'magic-string';
import typescript from 'rollup-plugin-typescript2';

/***
 * @function treeShake
 * @description Fixed tree shaking for typescript and rollup preserve modules
 * @see https://github.com/GiG/rollup-plugin-rename-extensions
 */
function treeShake() {
  return {
    name: 'rollup-plugin-tree-shake',
    generateBundle(options, bundle) {
      const files = Object.entries(bundle);

      for (const [, file] of files) {
        if (!file.isAsset) {
          const code = new MagicString(file.code);

          this.parse(file.code, {
            sourceType: 'module',
            onComment(block, text, start, end) {
              if (block && text === '* @class ') {
                code.overwrite(start, end, '/*#__PURE__*/');
              }
            }
          });

          if (options.sourcemap) {
            file.map = code.generateMap();
          }

          file.code = code.toString();
        }
      }
    }
  };
}

function onwarn(error, warn) {
  if (error.code !== 'CIRCULAR_DEPENDENCY') {
    warn(error);
  }
}

export default function configure(esnext) {
  let tsconfigOverride = esnext && { compilerOptions: { declaration: true, declarationDir: 'typings' } };

  return {
    onwarn,
    external: ['tslib'],
    input: 'src/index.ts',
    preserveModules: true,
    plugins: [typescript({ tsconfigOverride, clean: true, useTsconfigDeclarationDir: true }), treeShake()],
    output: { interop: false, esModule: false, format: esnext ? 'esm' : 'cjs', dir: esnext ? 'esm' : 'cjs' }
  };
}
