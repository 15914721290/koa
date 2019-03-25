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
  pagination: ctx => {
    return backend.search_platform(ctx, {
      search_content: ctx.state.key,
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize,
      order: 'search'
    }).then(data => {
      const base = `${ctx.state.wwwOrigin}/search/?key=${encodeURI(ctx.state.key)}&type=${ctx.state.type}&page=`
      return converter.convertQueryPagination(base, ctx.state.pageIndex, kPageSize, data.total)
    })
  },
  rank3: require('../components/rank_3type/rank_3type.node')
}

module.exports = model