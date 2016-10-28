'use strict';

module.exports = {
  // 页面入口文件配置
  entry: {
    'qrcode.all': './src/index',
    'qrcode.encode': './src/encode/qrcode',
    'qrcode.decode': './src/decode/qrdecode'
  },
  // 入口文件输出配置
  output: {
    path: 'dist/',
    filename: '[name].js'
  },
  // 模块配置
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      query: {
        presets: [
          ['es2015', { loose: true }]
        ],
        plugins: ['transform-es3-property-literals', 'transform-es3-member-expression-literals']
      }
    }]
  },
  // 其它解决方案配置
  resolve: {
    alias: {
      jquery: 'jquery'
    }
  }
};
