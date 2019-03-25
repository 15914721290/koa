const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const { get_breadcrumb_platform_url } =require('../../services/platform')

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
              href: converter.convertContentUrl(ctx, value.content_url, true),
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
  detail: ctx => {
    const detail = ctx.state.detail
    const score_num = {
      重仓: 1,
      中仓: 2,
      轻仓: 3,
      观望: 4
    } [detail.platform_score] || 0
    const rebate_num = {
      '21': 1,
      '5': 2,
      '6': 3,
      '7': 4,
      '8': 5
    } [detail.rebate_column_id] || 0
    const www = ctx.state.wwwOrigin
    return {
      img: detail.platform_icon,
      name: detail.platform_name,
      rebate: detail.rebate_year_change,
      rebateHref: `${www}/p2p/0-${rebate_num}-0-0-0-0-0-0-1.html`,
      state: ['未知', '正常运营', '停业 / 转型', '问题平台'][
        detail.operation_state
      ],
      stateHref: `${www}/p2p/0-0-0-0-0-0-${detail.operation_state}-0-1.html`,
      score: detail.platform_score,
      scoreHref: `${www}/p2p/${score_num}-0-0-0-0-0-0-0-1.html`,
      moreHref: `${www}/p2p/${score_num}-${rebate_num}-0-0-0-0-${detail.operation_state}-0-1.html`,
      pingce: detail.test_info
    }
  },
  hyxw: ctx => {
    return backend
      .gtnews_list(ctx, {
        column_id: 'news_wd_wdxw'
      })
      .then(data => {
        let items = data.list.map(item => {
          return {
            img: item.news_img,
            href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
            text: item.news_title
          }
        })
        return {
          more: `${ctx.state.wwwOrigin}/news/`,
          items
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  zt: ctx => {
    return backend
      .gtspecial_list(ctx, {
        page_index: 0,
        page_size: 2,
        order: 'recom'
      })
      .then(data => {
        const items = data.list.map(item => ({
          img: item.scene_icon,
          text: item.scene_name,
          href: `${ctx.state.wwwOrigin}/zt/${item.scene_map}.html`
        }))
        return {
          items,
          more: `${ctx.state.wwwOrigin}/zt/`
        }
      })
  },
  rank: ctx => {
    return Promise.all(
      ['score', 'search', 'click'].map(value => {
        return backend.seoplatform_list(ctx, {
          page_index: 0,
          page_size: 10,
          order: value
        })
      })
    )
      .then(results => {
        const ranks = results.map(platform => {
          return platform.list.map(data => {
            return {
              name: data.platform_name,
              score: data.platform_score
            }
          })
        })
        return {
          zjpj: ranks[0],
          rmss: ranks[1],
          rqzs: ranks[2]
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          zjpj: [],
          rmss: [],
          rqzs: []
        }
      })
  },
  baseUrl: ctx => converter.convertSecondDomain(ctx, ctx.params.platform),
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/p2p/`,
      inner: '平台库'
    }, {
      href: get_breadcrumb_platform_url(ctx),
      inner: ctx.state.detail.platform_name
    }, {
      inner: '评测'
    }]
  },
  rank3: require('../components/rank_3type/rank_3type_small.node')
}

module.exports = async (ctx, next) => {
  await backend
    .seoplatform_detail(ctx, {
      platform_id: ctx.params.platform
    })
    .then(data => {
      ctx.state.detail = data.platform_info
    })
    .catch(err => {
      const referer = ctx.header && ctx.header.referer
      if (referer) {
        console.error(ctx.url, err, referer, ctx.header['user-agent'])
      } else {
        console.log(ctx.url, err, referer, ctx.header['user-agent'])
      }
      ctx.state.is404 = true
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

  await ctx.render('platform/platform_pingji', ctx.state.renderData)
}
