const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

const { loadEnv } = require('./env');

const mode = process.env.NODE_ENV || 'development';
const env = loadEnv(mode);

module.exports = {
  entry: path.resolve(__dirname, '../src/main.tsx'),
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'assets/js/[name].[contenthash:8].js',
    chunkFilename: 'assets/js/[name].[contenthash:8].chunk.js',
    clean: true,
    publicPath: env.APP_BASE_PATH
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    plugins: [new TsconfigPathsPlugin({ configFile: path.resolve(__dirname, '../tsconfig.json') })]
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024
          }
        },
        generator: {
          filename: 'assets/images/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[hash:8][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
      templateParameters: {
        appName: env.APP_NAME
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
      'process.env.APP_NAME': JSON.stringify(env.APP_NAME),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL),
      'process.env.APP_BASE_PATH': JSON.stringify(env.APP_BASE_PATH)
    })
  ]
};
