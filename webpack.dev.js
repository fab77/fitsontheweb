const path = require('path');

module.exports = [
  'source-map'
].map(devtool => ({
  mode: 'development',
  entry: './src/FITSOnTheWeb.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'FITSOnTheWeb.js',
    library: 'FITSOnTheWeb',
  },
  devtool,
  optimization: {
    runtimeChunk: true,
    usedExports: true
  }
}));