const Path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  devtool: "source-map",
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: Path.resolve(__dirname, 'bin'),
  },
  plugins: [
    new CopyPlugin([
      { from: 'src', to: '', ignore: ["*.ts"] },
    ]),
  ]
};