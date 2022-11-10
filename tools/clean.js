/**
 * @module clean
 */

import rimraf from 'rimraf';

function clean(paths) {
  if (Array.isArray(paths)) {
    for (const path of paths) {
      rimraf.sync(path);
    }
  } else {
    rimraf.sync(path);
  }
}

clean(['cjs', 'esm', 'types', 'examples/qrcode.js']);
