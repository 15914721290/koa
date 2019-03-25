const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const util = require('../../foundation/util')

const model = {
  mainNav: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'common'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_news_menu.block_content.map(
          item => {
            return {
              href: converter.convertContentUrl(ctx, item.content_url),
              inner: item.content_name,
              current: item.content_name.indexOf('首页') !== -1
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
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'common'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_news_menu.block_content[0].content_child_list.map(
          item => {
            return {
              href: converter.convertContentUrl(ctx, item.content_url),
              inner: item.content_name,
              current: item.content_name.indexOf('首页') !== -1
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
  mainSwiper: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_news_index'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_news_jdt.block_content.map(
          item => {
            return {
              img: item.content_icon,
              text: item.content_name,
              href: converter.convertContentUrl(ctx, item.content_url)
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
  hyrd: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_news_index'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_news_rd.block_content.map(
          item => {
            return {
              inner: item.content_name,
              href: converter.convertContentUrl(ctx, item.content_url)
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
  zxzx: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_news_index'
      })
      .then(data => {
        const content = data.scene_info.scene_block.seo_news_zxzx.block_content
        const first = content[0]
        const items = content.slice(1).map(item => {
          return {
            left: {
              inner: item.content_name,
              href: converter.convertContentUrl(ctx, item.content_url)
            },
            right: {
              inner: item.content_child_list[0].content_name,
              href: converter.convertContentUrl(
                ctx,
                item.content_child_list[0].content_url
              )
            }
          }
        })
        return {
          top: {
            title: first.content_name,
            summary: first.content_intro,
            href: converter.convertContentUrl(ctx, first.content_url)
          },
          items
        }
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          top: {},
          items: []
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
          ad2_2: converter.convertAdBlock(ctx, block['seo_ad_2.2'].block_content),
          ad2_5_1: converter.convertAdBlock(ctx, util.o(()=>block['seo_ad_2.5'].block_child_list['seo_ad_2.5-1'].block_content)),
          ad2_5_2: converter.convertAdBlock(ctx, util.o(()=>block['seo_ad_2.5'].block_child_list['seo_ad_2.5-2'].block_content)),
        }
        result['ad2_1_single'] = result['ad2_1'].slice(0,1)
        return result
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          ad2_1: [],
          ad2_2: [],
          ad2_5_1: [],
          ad2_5_2: [],
          ad2_1_single: []
        }
      })
  },
  categoryBlocks: ctx => {
    return backend
      .gtnews_getnewsalllist(ctx, {
        column_id: 'master_news',
        page_size: 5
      })
      .then(data => {
        const blocks = data.nav.map(category => ({
          name: category.column_name,
          swiper: category.lunbo.block_content.map(item => ({
            href: converter.convertContentUrl(ctx, item.content_url),
            img: item.content_icon,
            text: item.content_name
          })),
          rmxw: category.list.map(item => ({
            href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
            inner: item.news_title
          })),
          baike: category.wiki_info.list.map(item => ({
            href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
            inner: item.news_title
          })),
          zt: category.special_info.list.map(item => ({
            text: item.scene_name,
            img: item.scene_icon,
            href: `${ctx.state.wwwOrigin}/zt/${item.scene_map}.html`
          })),
          tabs: category.column_info.map(item => ({
            title: item.column_name,
            lines: item.column_list.map(line => ({
              // :wwworigin
              href: `${ctx.state.wwwOrigin}/news/${line.news_id}.html`,
              inner: line.news_title
            }))
          })),
          more: `${ctx.state.wwwOrigin}/news/${category.url_map}/`
        }))
        return blocks
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
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

  await ctx.render('news/news', ctx.state.renderData)
}
