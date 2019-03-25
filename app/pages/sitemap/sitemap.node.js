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
  filterList: ctx => {
    return backend.seoplatform_getColumnList(ctx).then(data => {
      const list = Object.values(data).map((value, i) => {
        let array = [0,0,0,0,0,0,0,0,1]
        const filters = value.list.map((column, j) => {
          const index = j + 1
          array[i] = index
          const join = array.join('-')
          return {
            name: column.column_name,
            href: `${ctx.state.wwwOrigin}/p2p/${join}.html`,
          }
        })

        return {
          name: value.name,
          filters
        }
      })
      return list
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  zt: ctx => {
    return backend.gtspecial_getSpecialAllList(ctx).then(data => {
      const items = data.map(item => ({
        inner: item.column_name + '专题',
        href: `${ctx.state.wwwOrigin}/zt/${item.url_map}/`
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  baike: ctx => {
    return backend.gtwiki_getwikialllist(ctx, {
      column_id: 'master_wiki'
    }).then(data => {
      const items = data.map(item => ({
        inner: item.column_name + '百科',
        href: `${ctx.state.wwwOrigin}/baike/${item.url_map}/`
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  news: ctx => {
    return backend.gtnews_getnewsalllist(ctx, {
      column_id: 'master_news'
    }).then(data => {
      const items = data.nav.map(item => ({
        inner: item.column_name,
        href: `${ctx.state.wwwOrigin}/news/${item.url_map}/`
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  }
}

module.exports = async (ctx, next) => {
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

  await ctx.render('sitemap/sitemap', ctx.state.renderData)
}