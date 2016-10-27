'use strict';

const path = require('path');

module.exports = {
  // 页面入口文件配置
  entry: {
    'qrcode.all': './src/index',
    'qrcode.encode': './src/encode/qrcode.js',
    'qrcode.decode': './src/decode/qrdecode.js'
  },
  // 入口文件输出配置
  output: {
    path: 'dist/',
    filename: '[name].js'
  },
  // 模块配置
  module: {
    loaders: [
      {
        test: path.join(__dirname, 'es6'),
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  // 其它解决方案配置
  resolve: {
    alias: {
      jquery: 'jquery'
    }
  }
};
