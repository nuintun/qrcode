/**
 * @module fix-types
 */

import { replaceTscAliasPaths } from 'tsc-alias';

replaceTscAliasPaths({
  verbose: true,
  outDir: 'types'
});
