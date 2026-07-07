const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  configureWebpack: {
    resolve: {
      alias: { '@': resolve('src') }
    }
  },
  css: {
    loaderOptions: {
      scss: {
        // 自动注入全局 SCSS 变量/mixin，所有 <style lang="scss"> 与 .scss 文件无需手动 @import
        additionalData: '@import "@/assets/styles/variables.scss";'
      }
    }
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    open: true
  }
}
