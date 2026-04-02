const path = require('path');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'production',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[contenthash:8].css',
      chunkFilename: 'assets/css/[name].[contenthash:8].chunk.css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../public/404.html'),
          to: path.resolve(__dirname, '../dist/404.html')
        }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    runtimeChunk: 'single',
    minimizer: ['...', new CssMinimizerPlugin()]
  }
});
