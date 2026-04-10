/**
 * @module clean
 */

import { rimraf } from 'rimraf';

await rimraf(['cjs', 'esm']);
