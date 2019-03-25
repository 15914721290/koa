const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const util = require('../../foundation/util')

const model = {
  rmzx: ctx => {
    return backend.gtnews_list(ctx, {
      pagesize: 10,
      order: 'hot'
    }).then(data => {
      let items = data.list.map(value => ({
        inner: value.news_title,
        href: `${ctx.state.wwwOrigin}/news/${value.news_id}.html`
      }))
      return {
        more: `${ctx.state.wwwOrigin}/news/`,
        items
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        more: `${ctx.state.wwwOrigin}/news/`,
        items: []
      }
    })
  },
  zttj: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_zttj.block_content.map(
          value => {
            return {
              img: value.content_icon,
              href: converter.convertContentUrl(ctx, value.content_url),
              text: value.content_name
            }
          }
        )
        return {
          more: `${ctx.state.wwwOrigin}/zt/`,
          items
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          more: `${ctx.state.wwwOrigin}/zt/`,
          items: []
        }
      })
  },
  hyxw: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_index'
      })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_ptxw.block_content.map(
          value => {
            const href = converter.convertContentUrl(ctx, value.content_url)
            return {
              img: value.content_icon,
              href: href,
              text: value.content_name
            }
          }
        )
        return {
          more: `${ctx.state.wwwOrigin}/news/wangdai/`,
          items
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          more: `${ctx.state.wwwOrigin}/news/wangdai/`,
          items: []
        }
      })
  },
  zxph: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_ptxw.block_content.map(
          value => {
            return {
              img: value.content_icon,
              href: converter.convertContentUrl(ctx, value.content_url),
              text: value.content_name
            }
          }
        )
        return {
          more: `${ctx.state.wwwOrigin}/news/wangdai/`,
          items
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          more: `${ctx.state.wwwOrigin}/news/wangdai/`,
          items: []
        }
      })
  },
  ptbk: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_ptbk.block_content.map(
          value => {
            return {
              href: converter.convertContentUrl(ctx, value.content_url),
              inner: value.content_name
            }
          }
        )
        return {
          more: `${ctx.state.wwwOrigin}/baike/wdbk/`,
          items
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          more: `${ctx.state.wwwOrigin}/baike/wdbk/`,
          items: []
        }
      })
  },
  mainNav: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'common' })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_menu.block_content.map(
          value => {
            return {
              href: converter.convertContentUrl(ctx, value.content_url),
              inner: value.content_name,
              current: value.content_name === '首页'
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
  swiper: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let items = data.scene_info.scene_block.seo_index_jdt.block_content.map(
          value => {
            return {
              img: value.content_icon,
              href: converter.convertContentUrl(ctx, value.content_url),
              text: value.content_name
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
  jrtt: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let list = data.scene_info.scene_block.seo_index_jrtt.block_child_list
        let block = list[Object.keys(list)[0]]
        let articles = block.block_content.map(value => {
          return {
            href: converter.convertContentUrl(ctx, value.content_child_list[0].content_url),
            inner: value.content_child_list[0].content_name
          }
        })
        return articles
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  ycwz: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let list = data.scene_info.scene_block.seo_index_ycwz.block_content
        const items = list.map(value => {
          return {
            href: converter.convertContentUrl(ctx, value.content_child_list[0].content_url),
            inner: value.content_child_list[0].content_name
          }
        })
        return items
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  newsTabs: ctx => {
    return backend
      .gtcustomscene_info(ctx, { scene_page: 'seo_index' })
      .then(data => {
        let result = []
        let list = data.scene_info.scene_block.seo_index_jrtt.block_child_list
        let keys = Object.keys(list)
        for (let i = 1; i < keys.length; ++i) {
          let block = list[keys[i]]
          let lines = block.block_content.map(value => {
            return {
              left: {
                inner: value.content_name,
                href: value.content_name !== 'advPosition' && converter.convertContentUrl(ctx, value.content_url),
              },
              right: {
                inner: value.content_child_list[0].content_name,
                href: converter.convertContentUrl(ctx, value.content_child_list[0].content_url)
              }
            }})
          result.push({
            title: block.block_name,
            lines: lines
          })
        }
        return result
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  platformTabs: require('../components/platform_tabs/platform_tabs.node'),
  rank3: require('../components/rank_3type/rank_3type.node'),
  ads: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_ad'
    }).then(data => {
      const block = data.scene_info.scene_block
      const result = {
        ad1_1: converter.convertAdBlock(ctx, block['seo_ad_1.1'].block_content),
        ad1_2: converter.convertAdBlock(ctx, block['seo_ad_1.2'].block_content),
        ad1_3: converter.convertAdBlock(ctx, block['seo_ad_1.3'].block_content),
        ad1_5: converter.convertAdBlock(ctx, block['seo_ad_1.5'].block_content),
        ad1_6: converter.convertAdBlock(ctx, block['seo_ad_1.6'].block_content),
        ad1_7_1: converter.convertAdBlock(ctx, util.o(()=>block['seo_ad_1.7'].block_child_list['seo_ad_1.7-1'].block_content)),
        ad1_7_2: converter.convertAdBlock(ctx, util.o(()=>block['seo_ad_1.7'].block_child_list['seo_ad_1.7-2'].block_content))
      }
      return result
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        ad1_1: [],
        ad1_2: [],
        ad1_3: [],
        ad1_5: [],
        ad1_6: [],
        ad1_7_1: [],
        ad1_7_2: []
      }
    })
  },
  filterPlatform: require('../components/filter_platform/filter_platform.node'),
  platformCount: ctx => {
    return backend.seoplatform_getPlatformCount(ctx).then(data => {
      return data.platform_count
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return '未知'
    })
  },
  recommend: ctx => {
    return backend.seoplatform_list(ctx, {
      page_index: 0,
      page_size: 20,
      order: 'recom'
    }).then(data => {
      let items = data.list.map(value => {
        return {
          name: value.platform_name,
          img: value.platform_icon,
          isHot: value.platform_index === 1,
          url: converter.convertSecondDomain(ctx, value.platform_name_en) + '/',
          rate: value.rebate_year_change
        }
      })
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
  advance: ctx => `${ctx.state.wwwOrigin}/p2p/0-0-0-0-0-0-0-0-1.html`
}

module.exports = async ctx => {
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

  await ctx.render('index/index', ctx.state.renderData)
}
