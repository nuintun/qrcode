/**
 * @module rspack.config.dev
 * @description 开发环境 Rspack 配置
 * @see https://github.com/facebook/create-react-app
 */

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import Koa from 'koa';
import rspack from '@rspack/core';
import compress from 'koa-compress';
import resolveIp from '../lib/ip.js';
import appConfig from '../../app.config.js';
import { findFreePorts } from 'find-free-ports';
import { createFsFromVolume, Volume } from 'memfs';
import { server as dev } from 'rspack-dev-middleware';
import resolveConfigure from './rspack.config.base.js';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';

const { ports } = appConfig;

// HTTP client error codes.
const HTTP_CLIENT_ERROR_CODES = new Set([
  'EOF', // End of file - client closed connection.
  'EPIPE', // Broken pipe - client disconnected.
  'ECANCELED', // Operation canceled.
  'ECONNRESET', // Connection reset by peer.
  'ECONNABORTED', // Connection aborted.
  'ERR_STREAM_PREMATURE_CLOSE' // Stream closed before finishing.
]);

/**
 * @function createMemfs
 * @return {import('../interface').FileSystem}
 */
function createMemfs() {
  const volume = new Volume();

  return createFsFromVolume(volume);
}

/**
 * @function resolvePort
 * @param {import('../interface').AppConfig['ports']} ports
 * @return {number}
 */
async function resolvePort(ports = [8000, 9000]) {
  if (!Array.isArray(ports)) {
    ports = [ports, ports + 1];
  }

  const [startPort, endPort = startPort + 1] = ports;
  const [port] = await findFreePorts(1, { startPort, endPort });

  return port;
}

(async () => {
  const ip = resolveIp();
  const fs = createMemfs();
  const port = await resolvePort(ports);
  const devServerHost = `http://${ip}:${port}`;
  const configure = await resolveConfigure(mode);

  configure.experiments.cache.version = 'dev';
  configure.devtool = 'eval-cheap-module-source-map';
  configure.watchOptions = { aggregateTimeout: 256 };

  configure.plugins.push(new ReactRefreshPlugin({ overlay: false }));

  const app = new Koa();
  const compiler = rspack(configure);

  const devService = await dev(compiler, {
    fs,
    headers: {
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    }
  });

  app.use(
    compress({
      br: false
    })
  );

  app.use(devService);

  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';
    ctx.body = fs.createReadStream(appConfig.entryHTML);
  });

  app.on('error', error => {
    if (!HTTP_CLIENT_ERROR_CODES.has(error.code)) {
      console.error(error);
    }
  });

  app.listen(port, () => {
    devService.logger.info(`server run at: \x1b[36m${devServerHost}\x1b[0m`);
  });
})();
