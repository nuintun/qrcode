/**
 * @module fix-types
 */

import { join, resolve } from 'path';
import { readdir, rename } from 'fs/promises';
import { replaceTscAliasPaths } from 'tsc-alias';

const configFile = resolve('tsconfig.json');

/**
 * @function renameDts
 * @description Rename `.d.ts` files in a directory to a specified extension
 * @param {string} dir The target directory to process
 * @param {string} ext The new extension to replace `.d.ts`
 * @returns {Promise<void>}
 */
async function renameDts(dir, ext) {
  // Stack to manage directories
  const stack = [dir];

  while (stack.length > 0) {
    const currentDir = stack.pop();

    // Read items in the current directory
    const items = await readdir(currentDir, { withFileTypes: true });

    // Collect all tasks for the current directory
    const tasks = items.map(async item => {
      const sourcePath = join(currentDir, item.name);

      if (item.isDirectory()) {
        // If it's a directory, push it onto the stack
        stack.push(sourcePath);
      } else if (item.isFile()) {
        const re = /\.d\.ts$/i;

        // If the file matches `.d.ts`, rename it
        if (re.test(sourcePath)) {
          const targetPath = sourcePath.replace(re, ext);

          await rename(sourcePath, targetPath);
        }
      }
    });

    // Process all tasks concurrently for the current directory
    await Promise.all(tasks);
  }
}

renameDts('cjs', '.d.cts')
  .then(async () => {
    return Promise.all([
      replaceTscAliasPaths({
        configFile,
        outDir: 'esm',
        verbose: true,
        resolveFullPaths: true,
        resolveFullExtension: '.d.ts'
      }),
      replaceTscAliasPaths({
        configFile,
        outDir: 'cjs',
        verbose: true,
        resolveFullPaths: true,
        resolveFullExtension: '.d.cts'
      })
    ]);
  })
  .catch(error => {
    console.error(error);
  });
