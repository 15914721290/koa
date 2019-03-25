const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const util = require('../../foundation/util')

const kPageSize = 10

const model = {
  newsList: ctx => {
    try {
      return ctx.state.newsList.list.map(item => {
        return {
          title: item.news_title,
          intro: item.news_intro,
          img: item.news_img,
          href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
          time: converter.convertTimestamp(item.start_time, true),
          labels: converter.convertLabels(ctx, item.news_label),
        }
      })
    } catch (err) {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    }
  },
  mainNavTitle: () => '资讯频道',
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
  pageTitle: ctx => ctx.state.pageTitle,
  mainNav: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'common'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_news_menu.block_content.map(item => {
          let current = item.content_name === ctx.state.pageTitle
          return {
            href: converter.convertContentUrl(ctx, item.content_url),
            inner: item.content_name,
            current
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
  categories: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'common'
    }).then(data => {
      let index = 0
      data.scene_info.scene_block.seo_news_menu.block_content.forEach((item, i) => {
        if (i > 0 && item.content_name === ctx.state.pageTitle) {
          index = i
        }
      })
      const content = data.scene_info.scene_block.seo_news_menu.block_content
      const items = content[index].content_child_list.map(item => {
        return {
          href: converter.convertContentUrl(ctx, item.content_url),
          inner: item.content_name
        }
      })
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  jrtt: ctx => {
    return backend
      .gtnews_topline(ctx, {
        column_id: ctx.state.id
      })
      .then(data => {
        const first = data.list[0]
        const top = {
          img: first.news_img,
          text: first.news_title,
          href: `${ctx.state.wwwOrigin}/news/${first.news_id}.html`
        }
        const others = data.list.slice(1).map(item => ({
          inner: item.news_title,
          href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`
        }))
        return {
          top,
          others
        }
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          top: {},
          others: []
        }
      })
  },
  categoryBaike: ctx => {
    const id = ctx.state.id.substring(ctx.state.id.indexOf('_') + 1)
    const column_id = 'wiki_' + id
    return backend
      .gtwiki_list(ctx, {
        column_id,
        what: 'wikiOrder',
        index: 'hot',
        page_size: 5
      })
      .then(data => {
        return data.list.map(item => ({
          href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
          inner: item.news_title
        }))
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  allBaike: ctx => {
    return backend
      .gtwiki_list(ctx, {
        column_id: 'master_wiki',
        what: 'wikiOrder',
        index: 'add',
        page_size: 5
      })
      .then(data => {
        return data.list.map(item => ({
          href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
          inner: item.news_title
        }))
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  pagination: ctx => {
    return converter.convertPagination(
      `${ctx.state.wwwOrigin}/news/${ctx.params.category}`,
      ctx.state.pageIndex,
      kPageSize,
      ctx.state.newsList.total)
  },
  zxph: ctx => {
    return backend.gtnews_newsorder(ctx).then(data => {
      const items = data.list.map(item => ({
        href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
        inner: item.news_title
      }))
      return {
        items,
        more: `${ctx.state.wwwOrigin}/news/`
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        items: [],
        more: `${ctx.state.wwwOrigin}/news/`
      }
    })
  },
  zt: ctx => {
    const channel = ctx.state.id.split('_')[1]
    return backend.gtspecial_list(ctx, {
      page_index: 0,
      page_size: 2,
      column_id: 'special_' + channel,
      order: 'recom'
    }).then(data => {
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
  ads: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_ad'
      })
      .then(data => {
        const block = data.scene_info.scene_block
        const result = {
          ad2_1: converter.convertAdBlock(ctx, block['seo_ad_2.1'].block_content),
          ad2_3: converter.convertAdBlock(ctx, block['seo_ad_2.3'].block_content),
          ad2_4: converter.convertAdBlock(ctx, block['seo_ad_2.4'].block_content)
        }
        const mapingAdKey = util.getAd_mark('normal', ctx.state.id)
        if(mapingAdKey) {
          result['ad2_pc'] = converter.convertAdBlock(ctx, util.o(()=>block[mapingAdKey.pKey].block_child_list[`${mapingAdKey.pKey}-1`].block_content))
          result['ad2_m'] = converter.convertAdBlock(ctx, util.o(()=>block[mapingAdKey.pKey].block_child_list[`${mapingAdKey.pKey}-2`].block_content))
          result['ad2_1_single'] = result['ad2_1'].slice(0,1)
        }
        return result
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          ad2_1: [],
          ad2_3: [],
          ad2_4: [],
          ad2_pc: [],
          ad2_m: [],
          ad2_1_single: []
        }
      })
  },
  channel: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_' + ctx.state.id
    }).then(data => {
      const list = data.scene_info.scene_block[ctx.state.id].block_child_list
      const values = Object.values(list)
      const swiper = values[0].block_content.map(item => ({
        img: item.content_icon,
        href: converter.convertContentUrl(ctx, item.content_url),
        text: item.content_name
      }))
      const hyrd = values[1].block_content.map(item => ({
        href: converter.convertContentUrl(ctx, item.content_url),
        inner: item.content_name
      }))
      const first = values[2].block_content[0]
      const top = {
        title: first.content_child_list[0].content_name,
        intro: first.content_child_list[0].content_intro,
        href: converter.convertContentUrl(ctx, first.content_child_list[0].content_url)
      }
      const articles = values[2].block_content.slice(1).map(item => ({
        left: {
          inner: item.content_name,
          href: converter.convertContentUrl(ctx, item.content_url),
        },
        right: {
          inner: item.content_child_list[0].content_name,
          href: converter.convertContentUrl(ctx, item.content_child_list[0].content_url)
        }
      }))
      return {
        swiper,
        hyrd,
        top,
        articles
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {}
    })
  },
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/news/`,
      inner: '资讯'
    }, {
      inner: ctx.state.pageTitle
    }]
  }
}

module.exports = async (ctx, next) => {
  ctx.state.newsList = await backend.gtnews_list(ctx, {
    column_id: ctx.state.id,
    page_index: ctx.state.pageIndex - 1,
    page_size: kPageSize,
    order: 'time'
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    return {}
  })

  const maxPage = Math.ceil(ctx.state.newsList.total / kPageSize) || 1
  if (ctx.state.pageIndex > maxPage) {
    console.log(`visit ${ctx.url} while max = ${maxPage}`)
    return await next()
  }

  ctx.state.pageTitle = ctx.state.newsList.level.next.column_name

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

  await ctx.render('news_category/news_channel', ctx.state.renderData)
}