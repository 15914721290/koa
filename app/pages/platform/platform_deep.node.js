const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const CONSTANT = require('../../foundation/constant')
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
  // 顶部-平台概要
  summary:require('../components/platform_summary2/platform_summary2.node'),
  // 正文-专家深度测评
  zjsdcp: require('../components/platform/zhu_jia_shen_du_ce_ping_full.node'),
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
      pingce: detail.test_info,
      capital: detail.company_capital,
      headCount: detail.company_size,
      captain: detail.company_legal,
      zhaiZhuan: detail.company_rights,
      state2: detail.operation_state_temporary,
      companyName: detail.company_name,
      icp: detail.record_icp,
      icp_num: detail.record_icp_pass,
      type: detail.company_type,
      time: converter.convertTimestamp(detail.company_time),
      code: detail.company_credit_code,
      phone: detail.company_phone,
      companyNum: detail.company_num,
      orgNum: detail.org_num,
      businessTime: detail.company_business_time,
      authority: detail.compay_authority,
      checkTime: converter.convertTimestamp(detail.company_check_time),
      industry: detail.company_industry,
      address: detail.company_address,
      businessField: detail.company_business_field,
      domain: detail.record_domain,
      domain_time: converter.convertTimestamp(detail.record_time),
      xz: detail.record_campany_xz
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
      href:get_breadcrumb_platform_url(ctx),
      inner: ctx.state.detail.platform_name
    }, {
      inner: '专家深度测评'
    }]
  },
  rank3: require('../components/rank_3type/rank_3type_small.node'),
  // 下载弹窗的二维码
  landingPageQr: ctx => {
    // http://183.6.116.151:8090/display/hujingentou/Landing+Page
    return converter.convertQrcode(ctx, CONSTANT.LANDINGPAGE.WebPlatformDetail)
  }
}

module.exports = async (ctx, next) => {
  ctx.state.baseUrl = converter.convertSecondDomain(ctx, ctx.params.platform)
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

  await ctx.render('platform/platform_deep', ctx.state.renderData)
}