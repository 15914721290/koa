const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const numUtils = require('../../foundation/NumberUtils')

const kPageSize = 8

const model = {
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
  mainNav: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'common'
      })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_menu.block_content.map(
          value => {
            return {
              href: converter.convertContentUrl(ctx, value.content_url),
              inner: value.content_name,
              current: value.content_name === '平台库'
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
  ads: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_ad'
    }).then(data => {
      const block = data.scene_info.scene_block
      return {
        ad1_2: converter.convertAdBlock(ctx, block['seo_ad_1.2'].block_content),
        ad3_1: converter.convertAdBlock(ctx, block['seo_ad_3.1'].block_content)
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        ad1_2: [],
        ad3_1: []
      }
    })
  },
  platformList: ctx => {
    return backend.seoplatform_list(ctx, {
      page_size: kPageSize,
      page_index: ctx.state.pageIndex - 1,
      column_arr: ctx.state.columnArray,
      order: ctx.state.order
    }).then(data => {
      const maxPage = Math.ceil(data.total / kPageSize) || 1
      if (ctx.state.pageIndex > maxPage) {
        ctx.state.is404 = true
        console.log(`visit ${ctx.url} while max = ${maxPage}, refer: ${ctx.header.referer}`)
        return []
      }

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
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  pagination: ctx => {
    return backend.seoplatform_list(ctx, {
      page_size: kPageSize,
      page_index: ctx.state.pageIndex - 1,
      column_arr: ctx.state.columnArray,
      order: ctx.state.order
    }).then(data => {
      let array = [...ctx.state.filters]
      array.pop()
      const join = array.join('-') + '-'
      return converter.convertHtmlPagination(`${ctx.state.wwwOrigin}/p2p/${join}`,
        ctx.state.pageIndex, kPageSize, data.total)
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {}
    })
  },
  orders: ctx => {
    const orders = [0, 1, 2].map(value => {
      let array = [...ctx.state.filters]
      array[7] = value
      array[8] = 1
      const join = array.join('-')
      return {
        href: `${ctx.state.wwwOrigin}/p2p/${join}.html`,
        current: value === ctx.state.filters[7]
      }
    })
    return orders
  },
  title: ctx => ctx.state.pageTitle,
  filterList: ctx => {
    const list = ctx.state.conditions.map((value, i) => {
      let array = [...ctx.state.filters]
      array[8] = 1
      let current = array[i]
      const filters = value.list.map((column, j) => {
        const index = j + 1
        array[i] = index
        const join = array.join('-')
        return {
          name: column.column_name,
          href: `${ctx.state.wwwOrigin}/p2p/${join}.html`,
          isCurrent: current === index
        }
      })

      array[i] = 0
      const join = array.join('-')
      return {
        name: value.name,
        all: {
          href: `${ctx.state.wwwOrigin}/p2p/${join}.html`,
          isCurrent: current === 0
        },
        filters
      }
    })
    return list
  },
  rmpt: ctx => {
    return backend.seoplatform_list(ctx, {
      page_index: 0,
      page_size: 5,
      order: 'search'
    }).then(data => {
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
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  rank3: require('../components/rank_3type/rank_3type_small.node'),
  baike: ctx => {
    return backend.gtwiki_list(ctx, {
      'column_id': 'wiki_wd',
      'what': 'wikiOrder',
      'index': 'hot',
      'page_size': 6
    }).then(data => {
      const items = data.list.map(item => ({
        inner: item.news_title,
        href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  zt: ctx => {
    return backend.gtspecial_list(ctx, {
      'page_index': 0,
      'page_size': 2,
      'order': 'click'
    }).then(data => {
      const items = data.list.map(item => ({
        img: item.scene_icon,
        text: item.scene_name,
        href: `${ctx.state.wwwOrigin}/zt/${item.scene_map}.html`
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  all: ctx => `${ctx.state.wwwOrigin}/p2p/0-0-0-0-0-0-0-0-1.html`,
  tkd: ctx => {
    return {
      title: ctx.state.pageTitle + 'P2P网贷平台推荐_互金跟投',
      description: '互金跟投为您推荐最新最热门的' + ctx.state.pageTitle + 'P2P网贷平台。'
    }
  },
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/p2p/`,
      inner: '平台库'
    }, {
      inner: '高级筛选'
    }]
  }
}

module.exports = async (ctx, next) => {
  const filters = ctx.params.filter.split('-')
  // 前7位是筛选条件，第8位是tab序号，第9位是页码。
  // 如果结果数为0，则页码是热门平台列表的页码
  if (filters.length !== 9) {
    return await next()
  }

  for (let i = 0; i < filters.length; i += 1) {
    if (!numUtils.isNonNegativeInteger(filters[i])) {
      return await next()
    } else {
      filters[i] = parseInt(filters[i])
    }
  }

  if (filters[7] > 2 || filters[8] < 1) {
    return await next()
  }

  await backend.seoplatform_getColumnList(ctx).then(data => {
    const values = Object.values(data)
    let pageTitle = ''
    const columnArray = {}
    for (let i = 0; i < 7; ++i) {
      // 0表示全部，所以不是 >=
      if (filters[i] > values[i].list.length) {
        ctx.state.is404 = true
        throw 'visit overflow'
      }
      if (filters[i] > 0) {
        if (values[i].type === 'percent') {
          pageTitle += values[i].name
        }
        pageTitle += values[i].list[filters[i] - 1].column_name

        columnArray[values[i].type] = [values[i].list[filters[i] - 1].column_id]
      }
    }

    ctx.state.filters = filters
    ctx.state.conditions = values
    ctx.state.pageTitle = pageTitle
    ctx.state.columnArray = columnArray
    ctx.state.order = ['new', 'rank', 'rebate'][filters[7]]
    ctx.state.pageIndex = filters[8]
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
  })

  if (ctx.state.is404) {
    return await next()
  }

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

  if (ctx.state.is404) {
    return await next()
  }

  await ctx.render('p2p_filter/p2p_filter', ctx.state.renderData)
}