const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')

const model = {
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
  filterPlatform: require('../components/filter_platform/filter_platform.node'),
  platformTabs: require('../components/platform_tabs/platform_tabs.node'),
  swiper: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_platform_index'
    }).then(data => {
      const items = data.scene_info.scene_block.seo_platform_index_pc1.block_content.map(item => ({
        img: item.content_icon,
        href: converter.convertContentUrl(ctx, item.content_url),
        time: converter.convertTimestamp(item.content_start_time, true),
        title: item.content_name,
        intro: item.content_intro
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  pc2: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_platform_index'
    }).then(data => {
      const items = data.scene_info.scene_block.seo_platform_index_pc2.block_content.map(item => ({
        img: item.content_icon,
        href: converter.convertContentUrl(ctx, item.content_url),
        title: item.content_name,
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  recom: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_platform_index'
    }).then(data => {
      const recom = data.scene_info.scene_block.seo_platform_index_recom
      const platforms = Object.values(recom.block_child_list)
      const tabs = platforms.map(p => {
        const items = p.block_content.map(item => ({
          name: item.content_name,
          intro: item.content_intro,
          img: item.content_icon,
          href: converter.convertContentUrl(ctx, item.content_url)
        }))
        return {
          name: p.block_name,
          items
        }
      })
      return {
        title: recom.block_name,
        more: `${ctx.state.wwwOrigin}/p2p/0-0-0-0-0-0-0-0-1.html`,
        tabs
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        title: '专家推荐平台',
        more: `${ctx.state.wwwOrigin}/p2p/0-0-0-0-0-0-0-0-1.html`,
        tabs: []
      }
    })
  },
  platformCount: ctx => {
    return backend.seoplatform_getPlatformCount(ctx).then(data => {
      return data.platform_count
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return '未知'
    })
  },
  news: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_platform_index'
    }).then(data => {
      const all = data.scene_info.scene_block.seo_platform_index_news.block_content
      return all.map(item => ({
        inner: item.content_name,
        href: converter.convertContentUrl(ctx, item.content_url)
      }))
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  baike: ctx => {
    return backend.gtcustomscene_blockinfo(ctx, {
      block_id: 'seo_index_ptbk'
    }).then(data => {
      const items = data.block_info.block_content.map(item => ({
        inner: item.content_name,
        href: converter.convertContentUrl(ctx, item.content_url)
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  zt: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_platform_index'
    }).then(data => {
      const items = data.scene_info.scene_block.seo_platform_index_special.block_content.map(item => ({
        img: item.content_icon,
        text: item.content_name,
        href: converter.convertContentUrl(ctx, item.content_url)
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  advance: ctx => `${ctx.state.wwwOrigin}/p2p/0-0-0-0-0-0-0-0-1.html`,
  rank3: require('../components/rank_3type/rank_3type.node'),
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
  ads: ctx => {
    return backend.gtcustomscene_info(ctx, {scene_page: 'seo_ad'}).then(data => {
      return {
        ad1_5: converter.convertAdBlock(ctx, data.scene_info.scene_block['seo_ad_1.5'].block_content)
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {ad1_5: []}
    })
  }
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

  await ctx.render('p2p/p2p', ctx.state.renderData)
}
