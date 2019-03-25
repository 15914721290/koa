const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const util = require('../../foundation/util')

const model = {
  article: ctx => {
    try {
      return {
        title: ctx.state.wikiInfo.news_title,
        content: ctx.state.wikiInfo.news_intro,
        time: converter.convertTimestamp(ctx.state.wikiInfo.start_time, true),
        labels: converter.convertLabels(ctx, ctx.state.wikiInfo.news_label),
        channel: {
          name: ctx.state.wikiInfo.level.column_name,
          href: converter.convertByUrlMap(ctx, ctx.state.wikiInfo.level.column_en_name)
        }
      }
    } catch (err) {
      console.error(ctx.url, err, ctx.header['referer'])
      return {}
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
              current: item.content_name.startsWith(ctx.state.wikiInfo.level.column_name)
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
    const column = ctx.state.wikiInfo.level.column_en_name
    let id = 'news_' + column.substring(column.indexOf('_') + 1)
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
    const column = ctx.state.wikiInfo.level.column_en_name
    let id = 'news_' + column.substring(column.indexOf('_') + 1)
    return backend.gtnews_list(ctx, {
      column_id: id,
      page_index: 0,
      page_size: 10,
      order: 'time'
    }).then(data => {
      const items = data.list.map(item => ({
        inner: item.news_title,
        href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
      }))
      return items
    })
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
  xgzx: ctx => {
    return backend.gtnews_newsRelated(ctx, {
      id: ctx.params.id,
      page_size: 6,
      type: 'wiki'
    }).then(data => {
      const items = data.map(item => ({
        title: item.news_title,
        intro: item.seo_desc,
        href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
        img: item.news_img
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  zxbk: ctx => {
    return backend.gtwiki_getwikialllist(ctx, {
      column_id: 'master_wiki',
      page_index: 0,
      page_size: 10,
      order: 'add'
    }).then(data => {
      const items = data.map(item => {
        const list = item.list.map(value => ({
          img: value.news_img,
          title: value.news_title,
          intro: value.news_intro,
          href: `${ctx.state.wwwOrigin}/baike/${value.news_id}.html`,
          time: converter.convertTimestamp(value.start_time, true),
          labels: converter.convertLabels(ctx, value.news_label)
        }))
        return {
          title: item.column_name,
          isCurrent: item.column_name === ctx.state.wikiInfo.level.column_name,
          more: `${ctx.state.wwwOrigin}/baike/${item.url_map}/`,
          list
        }
      })
      return items
    })
  },
  zt: ctx => {
    const column = ctx.state.wikiInfo.level.column_en_name
    let id = column.substring(column.indexOf('_') + 1)
    return backend.gtspecial_list(ctx, {
      page_index: 0,
      page_size: 2,
      column_id: 'special_' + id,
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
  tkd: ctx => ({
    title: ctx.state.wikiInfo.news_title + '_互金跟投',
    keyword: ctx.state.wikiInfo.seo_key,
    description: ctx.state.wikiInfo.seo_desc
  }),
  ads: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_ad'
      })
      .then(data => {
        const block = data.scene_info.scene_block
        const result = {
          ad2_3: converter.convertAdBlock(ctx, block['seo_ad_2.3'].block_content),
          ad2_4: converter.convertAdBlock(ctx, block['seo_ad_2.4'].block_content)
        }
        const mapingAdKey = util.getAd_mark('isArticle', util.o(() => ctx.state.wikiInfo.level.column_en_name ))
        result['ad_head_pc'] = converter.convertAdBlock(ctx, util.o(()=>block[mapingAdKey.dKey_pc.split('-')[0]].block_child_list[mapingAdKey.dKey_pc].block_content))
        result['ad_head_m'] = converter.convertAdBlock(ctx, util.o(()=>block[mapingAdKey.dKey_m.split('-')[0]].block_child_list[mapingAdKey.dKey_m].block_content))
        return result
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          ad2_3: [],
          ad2_4: [],
          ad_head_pc: [],
          ad_head_m: []
        }
      })
  },
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/baike/`,
      inner: '百科'
    }, {
      href: converter.convertByUrlMap(ctx, ctx.state.wikiInfo.level.column_en_name),
      inner: ctx.state.wikiInfo.level.column_name
    }, {
      inner: '正文'
    }]
  },
  channel: ctx => ctx.state.wikiInfo.level.column_name
}

module.exports = async (ctx, next) => {
  ctx.state.wikiInfo = await backend.gtwiki_wikiinfo(ctx, {
    news_id: ctx.params.id
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
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

  await ctx.render('baike/baike_detail', ctx.state.renderData)
}