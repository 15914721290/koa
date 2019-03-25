const Router = require('koa-router')

const router = new Router()

const mustEndsWithSlash = async (ctx, next) => {
  if (ctx.path.endsWith('/')) {
    await next()
  } else {
    ctx.status = 301
    ctx.redirect(ctx.path + '/' + ctx.search)
  }
}

const mustEndsWithHTML = async (ctx, next) => {
  if (!ctx.path.endsWith('html')) {
    ctx.state.is404 = true
  }
  await next()
}

router.use(require('./pages/base/base.node'))

router.get('/', mustEndsWithSlash, require('./pages/index/index.node'))
router.get('/p2p/', mustEndsWithSlash, require('./pages/p2p/p2p.node'))
router.get('/p2p-dh/', mustEndsWithSlash, require('./pages/p2p_dh/p2p_dh.node'))
router.get('/p2p/:filter.html', mustEndsWithHTML, require('./pages/p2p_filter/p2p_filter.node'))
router.get('/p2p/all/', async ctx => {
  ctx.status = 301
  ctx.redirect('/p2p/0-0-0-0-0-0-0-0-1.html')
})
router.get('/news/', mustEndsWithSlash, require('./pages/news/news.node'))
router.get('/news/:id.html', mustEndsWithHTML, require('./pages/news_detail/news_detail.node'))
router.get(['/news/:category-:page/', '/news/:category/'],
  require('./pages/news_category/news_category.node'))
router.get('/baike/:id.html', mustEndsWithHTML, require('./pages/baike/baike_detail.node'))
router.get(['/baike/:channel-:page/', '/baike/:channel/'],
  require('./pages/baike/baike_channel.node'))
router.get('/baike/', mustEndsWithSlash, require('./pages/baike/baike.node'))
router.get('/zt/:id.html', mustEndsWithHTML, require('./pages/zt_detail/zt_detail.node'))
router.get(['/zt/:topic-:page/', '/zt/:topic/'],
  require('./pages/zt_topic/zt_topic.node'))
router.get('/zt/', mustEndsWithSlash, require('./pages/zt/zt.node'))
router.get(['/tag/:tag-:page/', '/tag/:tag/'], mustEndsWithSlash,
  require('./pages/tag/tag.node'))
router.get('/rank/', mustEndsWithSlash, require('./pages/rank/rank.node'))
router.get('/rank/:filter.html', mustEndsWithHTML, require('./pages/rank/rank_filter.node'))
router.get('/search/', mustEndsWithSlash, require('./pages/search/search.node'))
router.get('/internal/:platform/', mustEndsWithSlash, require('./pages/platform/platform.node'))
router.get('/internal/:platform/beian/', mustEndsWithSlash, require('./pages/platform/platform_beian.node'))
// 专家深度测评
router.get('/internal/:platform/ceping/', mustEndsWithSlash, require('./pages/platform/platform_deep.node'))
router.get(['/internal/:platform/news-:page/', '/internal/:platform/news/'], mustEndsWithSlash,
  require('./pages/platform/platform_news.node'))
router.get('/internal/:platform/pingji/', mustEndsWithSlash, require('./pages/platform/platform_pingji.node'))
router.get(['/internal/:platform/guanfang-:page/', '/internal/:platform/guanfang/'], mustEndsWithSlash,
  require('./pages/platform/platform_guanfang.node'))
// http://183.6.116.151:8090/display/hujingentou/Landing+Page
router.get('/landingPage', require('./pages/landingPage/landingPage.node'))
router.get('/about.html', mustEndsWithHTML, require('./pages/about/about.node'))
router.get('/law.html', mustEndsWithHTML, require('./pages/law/law.node'))
router.get('/contact.html', mustEndsWithHTML, require('./pages/contact/contact.node'))
router.get('/sitemap.html', mustEndsWithHTML, require('./pages/sitemap/sitemap.node'))

router.all('*', require('./pages/404/404.node'))

module.exports = router
