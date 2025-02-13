/**
 * @module rspack.config.prod
 * @description 生产环境 Rspack 配置
 * @see https://github.com/facebook/create-react-app
 */

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import rspack from '@rspack/core';
import targets from '../lib/targets.js';
import resolveConfigure from './rspack.config.base.js';

(async () => {
  const configure = await resolveConfigure(mode);

  configure.devtool = false;
  configure.experiments.cache.version = 'dev';

  // 使用自定义 minimizer 工具
  configure.optimization.minimizer = [
    new rspack.SwcJsMinimizerRspackPlugin({
      minimizerOptions: {
        format: {
          comments: false
        }
      }
    }),
    new rspack.LightningCssMinimizerRspackPlugin({
      minimizerOptions: {
        errorRecovery: false,
        targets: await targets()
      }
    })
  ];

  const compiler = rspack(configure);

  compiler.run((error, stats) => {
    compiler.close(() => {
      if (error) {
        console.error(error);
      } else {
        console.log(stats.toString(compiler.options.stats));
      }
    });
  });
})();
