const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const numUtils = require('../../foundation/NumberUtils')

const kPageSize = 10
const kSearchTypeListText = {
  all: '综合',
  platform: '平台',
  news: '资讯',
  wiki: '百科'
}

const model = {
  pcHeadNav: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'common'
      })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_menu.block_content.map(
          value => {
            return {
              href: converter.convertContentUrl(ctx, value.content_url),
              inner: value.content_name
            }
          }
        )
        return items
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  recom: ctx => {
    return backend.gtnews_list(ctx, {
      order: 'add',
      page_size: kPageSize
    }).then(data => {
      const items = data.list.map(item => ({
        title: item.news_title,
        intro: item.news_intro,
        img: item.news_img,
        href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
        time: converter.convertTimestamp(item.start_time, true)
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  query: ctx => ({
    type: ctx.state.type,
    page: ctx.state.pageIndex,
    key: ctx.state.key
  }),
  tabBaseUrl: ctx => `${ctx.state.wwwOrigin}/search/?key=${encodeURI(ctx.state.key)}&page=1&type=`,
  pcSearchBarValue: ctx => ctx.state.key,
  tkd: ctx => ({
    title: (ctx.state.key || '搜索') + '_互金跟投'
  }),
  noKey: ctx => ctx.state.key.length === 0,
  searchBarSearchType: ctx => ctx.state.type,
  searchBarSearchTypeText: ctx => kSearchTypeListText[ctx.state.type]
}

const types = {
  platform: require('./search_platform.node'),
  wiki: require('./search_baike.node'),
  news: require('./search_news.node')
}

module.exports = async ctx => {
  // 没有搜索关键字，等于进入搜索主页，显示热搜，没有其它东西。
  // 搜索没有结果，显示暂无结果，平台tab显示” 平台排行“， 其它3个tab显示” 推荐阅读“

  if (numUtils.isNonNegativeInteger(ctx.query.page)) {
    ctx.state.pageIndex = parseInt(ctx.query.page) || 1
  } else {
    ctx.state.pageIndex = 1
  }
  const type = ctx.query.type
  if (type === 'platform' || type === 'wiki' || type === 'news') {
    ctx.state.type = type
    Object.assign(ctx.state.model, types[type])
  } else {
    ctx.state.type = 'all'
    Object.assign(ctx.state.model, require('./search_all.node'))
  }

  if (ctx.query.key) {
    ctx.state.key = decodeURI(ctx.query.key)
  } else {
    ctx.state.key = ''
    ctx.state.renderData.hotSearch = await require('../components/pc_hot_search/pc_hot_search.node')(ctx)
  }

  ctx.state.renderData.resultCount = 0

  Object.assign(ctx.state.model, model)
  const keys = Object.keys(ctx.state.model)
  await Promise.all(
    keys.map(key => {
      const module = ctx.state.model[key]
      return module(ctx)
    })
  ).then(results => {
    keys.forEach((key, index) => {
      ctx.state.renderData[key] = results[index]
    })
  })

  await ctx.render('search/search', ctx.state.renderData)
}