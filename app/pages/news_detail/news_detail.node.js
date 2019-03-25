const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const util = require('../../foundation/util')
const adService = require('../../services/adService')

const model = {
  article: ctx => {
    try {
      return {
        title: ctx.state.newsInfo.news_title,
        content: ctx.state.newsInfo.news_intro,
        time: converter.convertTimestamp(ctx.state.newsInfo.start_time, true),
        labels: converter.convertLabels(ctx, ctx.state.newsInfo.news_label),
        channel: {
          name: ctx.state.newsInfo.level.column_name,
          href: converter.convertByUrlMap(ctx, ctx.state.newsInfo.level.column_en_name)
        }
      }
    } catch (err) {
      console.error(ctx.url, err, ctx.header['referer'])
      return {}
    }
  },
  mainNav: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'common'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_news_menu.block_content.map(
          item => {
            let current = item.content_name === ctx.state.newsInfo.level.column_name
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
  categories: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'common'
    }).then(data => {
      let index = 0
      data.scene_info.scene_block.seo_news_menu.block_content.forEach((item, i) => {
        if (i > 0 && item.content_name === ctx.state.newsInfo.level.column_name) {
          index = i
        }
      })
      const content = data.scene_info.scene_block.seo_news_menu.block_content
      const items = content[index].content_child_list.map(item => ({
        href: converter.convertContentUrl(ctx, item.content_url),
        inner: item.content_name,
        current: item.content_name === ctx.state.newsInfo.level.next.column_name
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  jrtt: ctx => {
    var cid = ctx.state.newsInfo.level.column_en_name
    return backend.gtnews_topline(ctx, {
      column_id: cid
    }).then(data => {
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
    const name = ctx.state.newsInfo.level.column_en_name
    const id = name.substring(name.indexOf('_') + 1)
    const column_id = 'wiki_' + id
    return backend.gtwiki_list(ctx, {
      column_id,
      what: 'wikiOrder',
      index: 'hot',
      page_size: 5
    }).then(data => {
      return data.list.map(item => ({
        href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
        inner: item.news_title
      }))
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  allBaike: ctx => {
    return backend.gtwiki_list(ctx, {
      column_id: 'master_wiki',
      what: 'wikiOrder',
      index: 'add',
      page_size: 5
    }).then(data => {
      return data.list.map(item => ({
        href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
        inner: item.news_title
      }))
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
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
          ad2_3: converter.convertAdBlock(ctx, block['seo_ad_2.3'].block_content),
          ad2_4: converter.convertAdBlock(ctx, block['seo_ad_2.4'].block_content)
        }

        const mapingAdKey = util.getAd_mark('isArticle', util.o(() => ctx.state.newsInfo.level.next.column_en_name ))
        result['ad_head_pc'] = converter.convertAdBlock(ctx, util.o(()=>block[mapingAdKey.dKey_pc.split('-')[0]].block_child_list[mapingAdKey.dKey_pc].block_content))
        result['ad_head_m'] = converter.convertAdBlock(ctx, util.o(()=>block[mapingAdKey.dKey_m.split('-')[0]].block_child_list[mapingAdKey.dKey_m].block_content))
        // :ad gzh
        const ad_gzh = adService.get_gzh(ctx, block)
        result['ad_gzh_m'] = ad_gzh.find(o=>o.des==='m' && o.isOk)
        result['ad_gzh_pc'] = ad_gzh.find(o=>o.des==='pc' && o.isOk)
        // 测试数据 https://www.mydomain123.com/news/10275.html
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
  // 跟投福利
  gtfl: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_ad'
      })
      .then(data => {
        const block = data.scene_info.scene_block
        const gtfl = adService.get_gtfl(ctx, block)
        // :ad 跟投福利 gtfl
        // https://www.mydomain123.com/news/10137.html
        const re =  {
          ...gtfl,
          gtfl_1: gtfl.items[0],
          gtfl_2: gtfl.items[1],
          gtfl_3: gtfl.items[2]
        }
        return re
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          isOk: false
        }
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
      return {
        items: [],
        more: `${ctx.state.wwwOrigin}/news/`
      }
    })
  },
  xgzx: ctx => {
    return backend.gtnews_newsRelated(ctx, {
      id: ctx.params.id,
      page_size: 6,
      type: 'news'
    }).then(data => {
      const items = data.map(item => ({
        title: item.news_title,
        intro: item.seo_desc,
        href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
        img: item.news_img
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  zxxw: ctx => {
    return backend.gtnews_getnewsalllist(ctx, {
      column_id: ctx.state.newsInfo.level.column_en_name,
      page_index: 0,
      page_size: 10,
      order: 'add'
    }).then(data => {
      const items = data.nav.map(item => {
        const list = item.list.map(value => ({
          img: value.news_img,
          title: value.news_title,
          intro: value.news_intro,
          href: `${ctx.state.wwwOrigin}/news/${value.news_id}.html`,
          time: converter.convertTimestamp(value.start_time, true),
          labels: converter.convertLabels(ctx, value.news_label)
        }))
        return {
          title: item.column_name,
          isCurrent: item.column_name === ctx.state.newsInfo.level.next.column_name,
          more: `${ctx.state.wwwOrigin}/news/${item.url_map}/`,
          list
        }
      })
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  zt: ctx => {
    const channel = ctx.state.newsInfo.level.column_en_name
    const id = channel.substring(channel.indexOf('_') + 1)
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
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        items: [],
        more: `${ctx.state.wwwOrigin}/zt/`
      }
    })
  },
  tkd: ctx => ({
    title: ctx.state.newsInfo.news_title + '_互金跟投',
    keyword: ctx.state.newsInfo.seo_key,
    description: ctx.state.newsInfo.seo_desc
  }),
  breadcrumb: ctx => {
    return [
      {
        href: `${ctx.state.wwwOrigin}/news/`,
        inner: '资讯'
      }, {
        href: converter.convertByUrlMap(ctx, ctx.state.newsInfo.level.column_en_name),
        inner: ctx.state.newsInfo.level.column_name
      }, {
        href: converter.convertByUrlMap(ctx, ctx.state.newsInfo.level.next.column_en_name),
        inner: ctx.state.newsInfo.level.next.column_name
      }, {
        inner: '正文'
      }]
  },
  swiper: ctx => {
    return backend.gtcustomscene_blockinfo(ctx, {
      block_id: 'seo_news_column_recom_' + ctx.state.newsInfo.level.column_en_name
    }).then(data => {
      const items = data.block_info.block_content.map(item => ({
        text: item.content_name,
        href: converter.convertContentUrl(ctx, item.content_url),
        img: item.content_icon
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  channelName: ctx => ctx.state.newsInfo.level.column_name
}

module.exports = async (ctx, next) => {
  ctx.state.newsInfo = await backend.gtnews_newsinfo(ctx, {
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

  await ctx.render('news_detail/news_detail', ctx.state.renderData)
}