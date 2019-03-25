const path = require('path')
const Koa = require('koa')
const koaStatic = require('koa-static')
const bodyParser = require('koa-bodyparser')
const koaNunjucks = require('koa-nunjucks-2')
const compress = require('koa-compress')

const router = require('./router')
const config = require('./foundation/config')

// 尽早地获取url映射表。资讯、百科、专题，其url和id是不一致的，有个映射关系
require('./foundation/DataConverter').prepareUrlMap()

const app = new Koa()

// 记录渲染超时
app.use(async (ctx, next) => {
  if (config.verboseLog) {
    console.log('request: ' + ctx.url)
  }
  const begin = new Date().getTime()
  await next()
  const end = new Date().getTime()
  const ms = end - begin
  if (config.verboseLog) {
    console.log('request: ' + ctx.url + ' use ' + ms + ' ms')
  }
  if (ms > 480) {
    console.log('render overtime! url ' + ctx.url + ' use ' + ms + ' ms')
  }
  const ua = ctx.header['user-agent']
  if (ua && ua.indexOf('Baiduspider') != -1) {
    console.log('Baiduspider ' + ctx.url + ' in ' + ms + ' ms', ctx.header.referer)
  }
})

app.use(koaNunjucks({
  path: path.resolve(__dirname, './pages'),
  ext: 'njk',
  nunjucksConfig: {
    noCache: config.watchTemplate,
    watch: config.watchTemplate,
    trimBlocks: true,
    lstripBlocks: true
  },
  configureEnvironment: require('./foundation/njk-global')
}))

app.use(bodyParser())

app.use(compress({
  filter: function (content_type) {
    return /text/i.test(content_type)
  },
  threshold: 2048,
  flush: require('zlib').Z_SYNC_FLUSH
}))

// 生产环境是由nginx直接做静态托管的
if (config.staticPublic) {
  app.use(koaStatic(path.resolve(__dirname, './public')))
}

app.use(require('./foundation/ApiCache'))

app.use(router.routes()).use(router.allowedMethods())

module.exports = app
