const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  entry: './main/index.ts',
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.main.json'),
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'index.js',
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: 'eval-source-map',
};