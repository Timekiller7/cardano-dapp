const plugins = [];
if (process.env.NODE_ENV === 'development') {
  plugins.push('react-refresh/babel');
} // React hot reloading only needed in development mode

module.exports = {
    presets: ['@babel/preset-env'],
    plugins,
  };