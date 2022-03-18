const webpack = require('webpack');

module.exports = function override(config) {
  //do stuff with the webpack config...
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    crypto: require.resolve('crypto-browserify'),
  };
  config.resolve.extensions = [...config.resolve.extensions, '.ts', '.js'];
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];
  // console.log(config.resolve)
  // console.log(config.plugins)

  return config;
};
