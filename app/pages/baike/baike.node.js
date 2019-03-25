const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')

const model = {
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
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
  mainSwiper: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_wiki_index'
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_wiki_index_jdt.block_content.map(
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
        scene_page: 'seo_wiki_index',
        page_size: 12
      })
      .then(data => {
        const items = data.scene_info.scene_block.seo_wiki_index_rmbk.block_content.slice(9, 12).map(
          item => {
            return {
              inner: item.content_extend.info.news_title,
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
        scene_page: 'seo_wiki_index',
        page_size: 12
      })
      .then(data => {
        const content = data.scene_info.scene_block.seo_wiki_index_rmbk.block_content
        const first = content[0]
        const items = content.slice(1, 9).map(item => {
          return {
            inner: item.content_extend.info.news_title,
            href: converter.convertContentUrl(ctx, item.content_url)
          }
        })
        return {
          top: {
            title: first.content_extend.info.news_title,
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
        return {
          ad4_1: converter.convertAdBlock(ctx, block['seo_ad_4.1'].block_content),
        }
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          ad4_1: []
        }
      })
  },
  categoryBlocks: ctx => {
    return backend
      .gtwiki_getwikialllist(ctx, {
        column_id: 'master_wiki',
        page_size: 25
      })
      .then(data => {
        const blocks = data.map(category => {
          return {
            name: category.column_name,
            swiper: category.list.slice(0, 5).map(item => ({
              href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
              img: item.news_img,
              text: item.news_title
            })),
            rmxw: category.list.slice(5, 10).map(item => ({
              href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
              inner: item.news_title
            })),
            mainList: category.list.slice(10, 22).map(item => ({
              href: `${ctx.state.wwwOrigin}/baike/${item.news_id}.html`,
              inner: item.news_title
            })),
            news: category.news_list.map(item => ({
              href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
              inner: item.news_title
            })),
            zt: category.special_info.list.map(item => ({
              text: item.scene_name,
              img: item.scene_icon,
              href: `${ctx.state.wwwOrigin}/zt/${item.scene_map}.html`
            })),
            more: `${ctx.state.wwwOrigin}/baike/${category.url_map}/`
          }
        })
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

  await ctx.render('baike/baike', ctx.state.renderData)
}
