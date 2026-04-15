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
import resolveIp from './utils/ip.ts';
import { createMemfs } from './utils/fs.ts';
import { resolvePort } from './utils/port.ts';
import { isFunction } from './utils/typeof.ts';
import resolveConfigs from './rspack.config.base.ts';
import { server as dev } from 'rspack-dev-middleware';
import { ReactRefreshRspackPlugin } from '@rspack/plugin-react-refresh';

/**
 * @constant HTTP_CLIENT_ERROR_CODES
 * @description HTTP 客户端错误码集合，用于过滤可忽略的连接中断错误
 */
const HTTP_CLIENT_ERROR_CODES = new Set([
  'EOF', // 文件结束：客户端关闭连接
  'EPIPE', // 管道破裂：客户端断开连接
  'ECANCELED', // 操作已取消
  'ECONNRESET', // 连接被对端重置
  'ECONNABORTED', // 连接已中止
  'ERR_STREAM_PREMATURE_CLOSE' // 流在完成前提前关闭
]);

const [{ ports, historyApiFallback }, configure] = await resolveConfigs(mode);

const ip = resolveIp();
const fs = createMemfs();
const port = await resolvePort(ports);
const devServerHost = `http://${ip}:${port}`;

// @ts-expect-error
configure.experiments.cache.version = 'dev';
configure.devtool = 'eval-cheap-module-source-map';
configure.watchOptions = { aggregateTimeout: 256 };

// @ts-expect-error
configure.plugins.push(new ReactRefreshRspackPlugin());

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

if (historyApiFallback != null) {
  app.use(async ctx => {
    ctx.type = 'text/html; charset=utf-8';

    if (isFunction(historyApiFallback)) {
      ctx.body = fs.createReadStream(historyApiFallback(ctx.path));
    } else {
      ctx.body = fs.createReadStream(historyApiFallback);
    }
  });
}

app.on('error', error => {
  if (!HTTP_CLIENT_ERROR_CODES.has(error.code)) {
    console.error(error);
  }
});

app.listen(port, () => {
  devService.logger.info(`server run at: \x1b[36m${devServerHost}\x1b[0m`);
});
