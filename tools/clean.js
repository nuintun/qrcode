/**
 * @module clean
 * @license MIT
 * @author nuintun
 */

const rimraf = require('rimraf');

['es5', 'esnext', 'typings'].forEach(path => rimraf.sync(path));
