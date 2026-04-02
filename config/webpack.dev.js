const path = require('path');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'development',
  devtool: 'eval-cheap-module-source-map',

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    hot: true,
    open: false,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, '../public')
    }
  },
  plugins: [new ReactRefreshWebpackPlugin()]
});
