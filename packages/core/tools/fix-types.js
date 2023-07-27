/**
 * @module fix-types
 */

import { replaceTscAliasPaths } from 'tsc-alias';

replaceTscAliasPaths({
  outDir: 'types'
});
