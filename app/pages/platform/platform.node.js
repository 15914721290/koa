const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const CONSTANT = require('../../foundation/constant')
// const util = require('../../foundation/util')
const adService = require('../../services/adService')
const platformService = require('../../services/platform')


const model = {
  // 顶部-导航栏
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
  // 顶部-热搜 搜索
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
  // 顶部-面包屑
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/p2p/`,
      inner: '平台库'
    }, {
      inner: ctx.state.detail.platform_name
    }]
  },
  // 顶部-平台概要
  summary:require('../components/platform_summary2/platform_summary2.node'),

  // 平台详情
  detail: ctx => {
    const detail = ctx.state.detail
    const score_num = {
      重仓: 1,
      中仓: 2,
      轻仓: 3,
      观望: 4
    }[detail.platform_score] || 0
    const rebate_num = {
      '21': 1,
      '5': 2,
      '6': 3,
      '7': 4,
      '8': 5
    }[detail.rebate_column_id] || 0
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
      type: detail.company_type,
      time: converter.convertTimestamp(detail.company_time),
      code: detail.company_credit_code
    }
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

  //正文-争议信息 黑名单
  zyxx: require('../components/platform/zheng_yi_xin_xi/zheng_yi_xin_xi.node'),
  // 正文-专家简评
  zjjp: require('../components/platform/zhu_jia_jian_ping.node'),
  // 正文-专家深度测评
  zjsdcp: require('../components/platform/zhu_jia_shen_du_ce_ping.node'),
  // 正文-测评追踪
  cpgz: require('../components/platform/ce_ping_zhui_zong.node'),
  // 正文-信息披露追踪
  xxplzz: require('../components/platform/xin_xi_pi_lu_zhui_zong.node'),
  // 正文-平台舆论追踪
  ptylzz: platformService.ptylzz,
  // 正文- 平台问答
  ptwd: platformService.ptwd,
  // 正文- 投友点评
  tydp: platformService.tydp,

  // 正文栏尾部-平台动态
  ptdt: ctx => {
    return backend
      .gtnews_list(ctx, {
        column_id: 'news_wd_ptdt',
        pf_id: ctx.state.detail.platform_id,
        order: 'time'
      })
      .then(data => {
        const items = []
        data.total > 0 && data.list.forEach(item => {
          items.push({
            title: item.news_title,
            intro: item.news_intro,
            img: item.news_img,
            href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
            time: converter.convertTimestamp(item.start_time, true),
            labels: converter.convertLabels(ctx, item.news_label),
          })
        })
        return items
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  // 正文栏尾部-平台新闻
  news: ctx => {
    return backend
      .gtnews_list(ctx, {
        column_id: 'news_wd_wdxw',
        pf_id: ctx.state.detail.platform_id,
        order: 'time'
      })
      .then(data => {
        const items = []
        data.total > 0 && data.list.forEach(item => {
          items.push({
            title: item.news_title,
            intro: item.news_intro,
            img: item.news_img,
            href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
            time: converter.convertTimestamp(item.start_time, true),
            labels: converter.convertLabels(ctx, item.news_label),
          })
        })
        return items
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  // 正文栏尾部-相关平台推荐
  recom: ctx => {
    return backend.seoplatform_recommendPlatform(ctx, {
      platform_id: ctx.params.platform
    }).then(data => {
      const items = data.list.map(item => ({
        img: item.platform_icon,
        href: converter.convertSecondDomain(ctx, item.platform_name_en),
        name: item.platform_name,
        rebate: item.rebate_year_change
      }))
      return items
    })
  },

  // 右侧栏-1行业新闻
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
  // 右侧栏-2专题推荐
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
  // 右侧栏-3平台排行榜
  rank3: require('../components/rank_3type/rank_3type_small.node'),

  // 在js里使用
  serverAddress: ctx => {
    const addr = require('../../foundation/config').serverAddress
    const a = addr.replace('http', ctx.state.origin.substring(0, ctx.state.origin.indexOf(':')))
    return a
  },
  // 下载弹窗的二维码
  landingPageQr: ctx => {
    // http://183.6.116.151:8090/display/hujingentou/Landing+Page
    return converter.convertQrcode(ctx, CONSTANT.LANDINGPAGE.WebPlatformDetail)
  },
  followImg: ctx => {
    // http://183.6.116.151:8090/pages/viewpage.action?pageId=4427048
    return {
      platform_wx_img: (ctx.state.detail && ctx.state.detail.platform_wx_img) || ''
    }
  },
  ads: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_ad'
      })
      .then(data => {
        const block = data.scene_info.scene_block
        const ad_detail = adService.get_platform_ad(ctx, block)
        // :ad adPlatform
        // https://fulijr.mydomain123.com/
        return {
          ad_detail_pc: ad_detail.find(o => o.des==='pc'),
          ad_detail_m: ad_detail.find(o => o.des==='m')
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
        }
      })
  }
}

module.exports = async (ctx, next) => {
  const platform = ctx.params.platform
  if (platform.indexOf('.') != -1) {
    return await next()
  }
  // :二级域名转换secondorigin
  ctx.state.baseUrl = converter.convertSecondDomain(ctx, ctx.params.platform)

  await backend
    .seoplatform_detail(ctx, {
      platform_id: platform
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

  await ctx.render('platform/platform', ctx.state.renderData)
}
