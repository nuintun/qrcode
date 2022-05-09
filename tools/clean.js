/**
 * @module clean
 */

import rimraf from 'rimraf';

function clean(paths) {
  paths = Array.isArray(paths) ? paths : [paths];

  paths.forEach(path => rimraf.sync(path));
}

clean(['cjs', 'esm', 'types', 'examples/qrcode.js']);
