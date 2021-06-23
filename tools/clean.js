/**
 * @module clean
 * @license MIT
 * @author nuintun
 */

const rimraf = require('rimraf');

['cjs', 'esm', 'typings'].forEach(path => rimraf.sync(path));
