/**
 * @module clean
 * @license MIT
 * @author nuintun
 */

const del = require('del');

del.sync(['es5', 'esnext', 'typings'], { force: true });
