// 要实现的需求：
//               本地开发     测试服务器       生产服务器
// 百度统计         否          否              是
// 调试             是           否            否
// 模板缓存、监控    是          否              否
// 服务器地址      测试环境      测试环境       生产环境
// 静态资源路由      是           是             否

const base = {
  version: require('../../package.json').version,
}

const config = {
  local: {
    ...base,
    watchTemplate: true,
    serverAddress: 'http://183.6.116.151:6090/seo_feature_v2.3/',
    statistics: false,
    staticPublic: true,
    verboseLog: true,
  },
  test: {
    ...base,
    watchTemplate: false,
    serverAddress: 'http://183.6.116.151:6090/seo_feature_v2.3/',
    statistics: false,
    staticPublic: true,
    verboseLog: false,
  },
  production: {
    ...base,
    watchTemplate: false,
    serverAddress: 'http://app.51hjgt.com/',
    statistics: true,
    staticPublic: false,
    verboseLog: false
  }
}

const use = config[process.env.NODE_ENV || 'local']

module.exports = use