const backend = require('../../foundation/backend')
const numUtils = require('../../foundation/NumberUtils')

module.exports = async (ctx, next) => {
  const page = ctx.params.page || '1'
  if (!numUtils.isNonNegativeInteger(page) || page < 1) {
    return await next()
  }
  ctx.state.pageIndex = parseInt(page)

  await backend.gtcolumn_urlMap(ctx).then(data => {
    ctx.state.newsMap = data.master_news
    ctx.state.id = ctx.state.newsMap[ctx.params.category]
    if (!ctx.state.id) {
      ctx.state.is404 = true
      console.log(`category ${ctx.params.category} not exists, referer: ${ctx.header.referer}`)
    }
  })

  if (ctx.state.is404) {
    return await next()
  }

  if (!ctx.path.endsWith('/')) {
    ctx.status = 301
    ctx.redirect(ctx.path + '/' + ctx.search)
    return
  }

  // category分两种，频道和列表页都是这样的url，通过下划线的个数来区分是最方便的
  if (ctx.state.id.split('_').length === 2) {
    await require('./news_channel.node')(ctx, next)
  } else {
    await require('./news_list.node')(ctx, next)
  }
}