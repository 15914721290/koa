const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const numUtils = require('../../foundation/NumberUtils')

const kPageSize = 10

const model = {
  wikiList: ctx => {
    try {
      return ctx.state.wikiList.list.map(item => {
        return {
          title: item.news_title,
          intro: item.news_intro,
          img: item.news_img,
          href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
          time: converter.convertTimestamp(item.start_time, true),
          labels: converter.convertLabels(ctx, item.news_label),
        }
      })
    } catch (err) {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    }
  },
  mainNavTitle: () => '百科频道',
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
        const items = data.scene_info.scene_block.seo_wiki_menu.block_content.map(
          item => {
            return {
              href: converter.convertContentUrl(ctx, item.content_url),
              inner: item.content_name,
              current: item.content_name.startsWith(ctx.state.pageTitle)
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
    let id = 'news_' + ctx.state.id.substring(ctx.state.id.indexOf('_') + 1)
    return backend
      .gtnews_topline(ctx, {
        column_id: id
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
  news: ctx => {
    let id = 'news_' + ctx.state.id.substring(ctx.state.id.indexOf('_') + 1)
    return backend.gtnews_list(ctx, {
      column_id: id,
      page_index: 0,
      page_size: kPageSize,
      order: 'time'
    }).then(data => {
      const items = data.list.map(item => ({
        inner: item.news_title,
        href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
      }))
      return items
    })
  },
  pagination: ctx => {
    return converter.convertPagination(
      `${ctx.state.wwwOrigin}/baike/${ctx.params.channel}`,
      ctx.state.pageIndex,
      kPageSize,
      ctx.state.wikiList.total)
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
      return {}
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
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        items: [],
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
        return {
          ad2_1: converter.convertAdBlock(ctx, block['seo_ad_2.1'].block_content),
          ad2_3: converter.convertAdBlock(ctx, block['seo_ad_2.3'].block_content),
          ad2_4: converter.convertAdBlock(ctx, block['seo_ad_2.4'].block_content)
        }
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          ad2_1: [],
          ad2_2: [],
          ad2_3: []
        }
      })
  },
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/baike/`,
      inner: '百科'
    }, {
      inner: ctx.state.pageTitle
    }]
  }
}

module.exports = async (ctx, next) => {
  const page = ctx.params.page || '1'
  if (!numUtils.isNonNegativeInteger(page) || page < 1) {
    return await next()
  }
  ctx.state.pageIndex = parseInt(page)

  await backend.gtcolumn_urlMap(ctx).then(data => {
    ctx.state.wikiMap = data.master_wiki
    ctx.state.id = ctx.state.wikiMap[ctx.params.channel]
    if (!ctx.state.id) {
      ctx.state.is404 = true
      console.log(`category ${ctx.params.channel} not exists, referer: ${ctx.header.referer}`)
    }
  })

  if (ctx.state.is404) {
    return await next()
  }

  if (!ctx.path.endsWith('/')) {
    ctx.status = 301
    ctx.redirect(ctx.path + '/' + ctx.search)
    return
  }

  ctx.state.wikiList = await backend.gtwiki_list(ctx, {
    column_id: ctx.state.id,
    page_index: ctx.state.pageIndex - 1,
    page_size: kPageSize,
    order: 'add',
    what: 'wikiOrder'
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    return {}
  })

  const maxPage = Math.ceil(ctx.state.wikiList.total / kPageSize) || 1
  if (ctx.state.pageIndex > maxPage) {
    console.log(`visit ${ctx.url} while max = ${maxPage}`)
    return await next()
  }

  ctx.state.pageTitle = ctx.state.wikiList.column_info.column_name

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

  await ctx.render('baike/baike_channel', ctx.state.renderData)
}