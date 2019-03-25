const config = require('./config')
module.exports = env => {
  env.addGlobal('appVersion', config.version)
  env.addGlobal('statistics', config.statistics)
}