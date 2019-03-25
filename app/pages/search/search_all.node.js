const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')

const kPageSize = 10

const model = {
  platform: ctx => {
    return backend.search_platform(ctx, {
      search_content: ctx.state.key,
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize,
      order: 'search'
    }).then(data => {
      ctx.state.renderData.resultCount += parseInt(data.total)
      if (data.total > 0) {
        const items = data.list.map(item => ({
          img: item.platform_icon,
          name: item.platform_name,
          href: converter.convertSecondDomain(ctx, item.platform_name_en),
          rate: item.rebate_year_change,
          score: item.platform_score,
          rank: item.platform_score_rank,
          state: item.operation_state
        }))
        return items
      } else {
        return []
      }
    })
  },
  news: ctx => {
    return backend.search_searchNews(ctx, {
      keyWord: ctx.state.key,
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize
    }).then(data => {
      ctx.state.renderData.resultCount += parseInt(data.count)
      if (data.count > 0) {
        const items = data.list.map(item => ({
          title: item.news_title,
          intro: item.news_intro,
          img: item.news_img,
          href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
          time: converter.convertTimestamp(item.start_time, true)
        }))
        return items
      } else {
        return []
      }
    })
  },
  baike: ctx => {
    return backend.search_searchWiki(ctx, {
      keyWord: ctx.state.key,
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize
    }).then(data => {
      ctx.state.renderData.resultCount += parseInt(data.count)
      if (data.count > 0) {
        const items = data.list.map(item => ({
          title: item.news_title,
          intro: item.news_intro,
          img: item.news_img,
          href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
          time: converter.convertTimestamp(item.start_time, true)
        }))
        return items
      } else {
        return []
      }
    })
  },

}

module.exports = model