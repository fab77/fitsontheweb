//const path = require('path');
//
//
//
//const { merge } = require('webpack-merge');
//const common = require('./webpack.common.js');
//
//module.exports = merge(common, {
//  mode: 'development',
//  devtool: 'inline-source-map',
//  devServer: {
//    contentBase: './dist',
//  },
//  entry: './src/FITSOnTheWeb.js',
////  output: {
////    path: path.resolve(__dirname, 'dist'),
////    filename: 'FITSOnTheWeb.js',
////    library: 'FITSOnTheWeb',
////  },
//  optimization: {
//    runtimeChunk: true,
//    usedExports: true
//  }
//});