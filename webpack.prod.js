const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    clean: true,
    path: path.resolve(__dirname, 'lib'),
    filename: 'index.js',
    libraryTarget: 'umd',
    // libraryTarget: 'module', // 可选，指定输出格式为 es module,webpack5以下不兼容,暂不启用
    // module: true,
  },
  // experiments: {
  //   outputModule: true, // es module模式必须启用实验性特性
  // },
}