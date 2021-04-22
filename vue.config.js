const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}
module.exports = {
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@utils', resolve('src/utils'));
  },
  devServer: {
    proxy: {
      '/api': {
        target: 'http://tdata.airlook.com',
        ws: true,
        changeOrigin: true
      },
    }
  }
}