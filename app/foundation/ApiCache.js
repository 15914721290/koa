// 使用udp实现多进程间通信。因为多进程已经交给pm2来管理，不能使用nodejs自带的cluster模块
// 来进行通信了。
// 根据pm2的文档，pm2会设置 NODE_APP_INSTANCE 给每个进程一个id
// pm2设置成了进程数=cpu核数

const dgram = require('dgram')
const portBase = 44320
const port = portBase + (parseInt(process.env.NODE_APP_INSTANCE) || 0)
const server = dgram.createSocket('udp4')
const backend = require('./backend')
const command = 'nihao'

server.on('listening', () => {
  console.log('udp listening at port ' + port)

})

server.on('message', msg => {
  const c = msg.toString()
  console.log('receive udp command: ' + msg.toString())
  if (c === command) {
    backend.clearCache()
  }
})

server.on('error', err => {
  console.log(err)
  server.close()
})

server.bind(port, 'localhost')

function sendCommand() {
  const num = require('os').cpus().length
  for (let p = portBase + num; p >= portBase; --p) {
    if (p === port) {
      continue
    }
    (function(p) {
      const client = dgram.createSocket('udp4')
      client.send(command, p, 'localhost', function () {
        client.close()
      })
    })(p)
  }
}

module.exports = async (ctx, next) => {
  if (ctx.query.ref == 1) {
    try {
      const api = eval(ctx.query.api)
      if (api.length === 0) {
        ctx.state.apiClean = 'all'
      } else {
        const apiClean = {}
        api.forEach(item => apiClean[`${item.path}?c=${item.action}`] = true)
        ctx.state.apiClean = apiClean
      }
      backend.clearCache()
      sendCommand()
    } catch (err) {
      console.log(err)
    }
  }

  await next()
}