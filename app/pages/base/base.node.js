const converter = require('../../foundation/DataConverter')

module.exports = async (ctx, next) => {
  // 这个header是nginx配置的
  const protocol = ctx.header['x-forwarded-proto']
  if (protocol) {
    ctx.state.origin = protocol + '://' + ctx.host
  } else {
    ctx.state.origin = ctx.origin
  }

  const wwwOrigin = converter.convertWwwDomain(ctx)
  ctx.state.wwwOrigin = wwwOrigin
  ctx.state.renderData = {
    wwwOrigin
  }
  ctx.state.baseModel = {
    yqlj: require('../components/yqlj/yqlj.node'),
    pcHead: require('../components/pc_head/pc_head.node'),
    footer: require('../components/footer/footer.node')
  }
  ctx.state.model = {
    ...ctx.state.baseModel
  }

  await next()
}