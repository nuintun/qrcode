/**
 * @module fix-types
 */

import { join } from 'node:path';
import { resolvePaths } from 'dts-paths';
import { readdir, rename } from 'node:fs/promises';

/**
 * @function renameDts
 * @description Rename `.d.ts` files in a directory to a specified extension.
 * @param {string} dir The target directory to process.
 * @param {string} ext The new extension to replace `.d.ts`.
 * @returns {Promise<void>}
 */
async function renameDts(dir, ext) {
  // Stack to manage directories.
  const stack = [dir];

  while (stack.length > 0) {
    const currentDir = stack.pop();

    // Read items in the current directory.
    const items = await readdir(currentDir, { withFileTypes: true });

    // Collect all tasks for the current directory.
    const tasks = items.map(async item => {
      const sourcePath = join(currentDir, item.name);

      if (item.isDirectory()) {
        // If it's a directory, push it onto the stack.
        stack.push(sourcePath);
      } else if (item.isFile()) {
        const re = /\.d\.ts$/i;

        // If the file matches `.d.ts`, rename it.
        if (re.test(sourcePath)) {
          const targetPath = sourcePath.replace(re, ext);

          await rename(sourcePath, targetPath);
        }
      }
    });

    // Process all tasks concurrently for the current directory.
    await Promise.all(tasks);
  }
}

renameDts('cjs', '.d.cts')
  .then(async () => {
    return Promise.all([
      resolvePaths('cjs', {
        compilerOptions: {
          paths: {
            '/*': ['cjs/*']
          }
        },
        extensions: ['.d.cts']
      }),
      resolvePaths('esm', {
        compilerOptions: {
          paths: {
            '/*': ['esm/*']
          }
        },
        extensions: ['.d.ts']
      })
    ]);
  })
  .then(
    ([cjs, esm]) => {
      console.log(`fix cjs types: ${cjs.size} files`);
      console.log(`fix esm types: ${esm.size} files`);
    },
    error => {
      console.error(error);
    }
  );
