const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
  ],
  entry: './src/test.js',
  devtool: 'inline-source-map',
  devServer: {
    client: {
      progress: true,
    },
    static: {
      directory: path.join(__dirname, 'public'),
    }
  },
});