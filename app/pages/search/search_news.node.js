const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')

const kPageSize = 10

const model = {
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
  pagination: ctx => {
    return backend.search_searchNews(ctx, {
      keyWord: ctx.state.key,
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize
    }).then(data => {
      const base = `${ctx.state.wwwOrigin}/search/?key=${encodeURI(ctx.state.key)}&type=${ctx.state.type}&page=`
      return converter.convertQueryPagination(base, ctx.state.pageIndex, kPageSize, data.count)
    })
  }
}

module.exports = model