'use strict';

module.exports = {
  //页面入口文件配置
  entry: {
    'qrcode.all': 'src/index.js',
    'qrcode.encode': 'src/encode/qrcode.js',
    'qrcode.decode': 'src/decode/qrdecode.js'
  },
  //入口文件输出配置
  output: {
    path: 'dist/',
    filename: '[name].js'
  },
  //其它解决方案配置
  resolve: {
    alias: {
      jquery: 'jquery'
    }
  }
};
