const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const numUtils = require('../../foundation/NumberUtils')

const kPageSize = 16

const model = {
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
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
              current: value.content_name === '专题'
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
  categoryName: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: ctx.state.scenePage
    })
      .then(data => data.scene_info.scene_name)
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return ''
      })
  },
  topics: ctx => {
    return backend.gtspecial_list(ctx, {
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize,
      column_id: ctx.state.topicName
    }).then(data => {
      const maxPage = Math.ceil(data.total / kPageSize) || 1
      if (ctx.state.pageIndex > maxPage) {
        ctx.state.is404 = true
        console.log(`visit ${ctx.url} while max = ${maxPage}`)
        return []
      }

      const items = data.list.map(item => ({
        text: item.scene_name,
        img: item.scene_icon,
        href: `${ctx.state.wwwOrigin}/zt/${item.scene_map}.html`
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  pagination: ctx => {
    return backend.gtspecial_list(ctx, {
      page_index: ctx.state.pageIndex - 1,
      page_size: kPageSize,
      column_id: ctx.state.topicName
    }).then(data => {
      return converter.convertPagination(`${ctx.state.wwwOrigin}/zt/${ctx.params.topic}`, ctx.state.pageIndex, kPageSize, data.total)
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {}
    })
  },
  breadcrumb: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: ctx.state.scenePage
    })
      .then(data => {
        return [{
          href: `${ctx.state.wwwOrigin}/zt/`,
          inner: '专题'
        }, {
          inner: data.scene_info.scene_name
        }]
      })
      .catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return ''
      })
  },
}

module.exports = async (ctx, next) => {
  const page = ctx.params.page || '1'
  if (!numUtils.isNonNegativeInteger(page) || page < 1) {
    return await next()
  }
  ctx.state.pageIndex = parseInt(page)

  // 需要先查询是否存在这个topic，并且topic需要映射成特殊的参数传递给下个接口。
  // 这个api设计不好
  const topic = ctx.params.topic
  ctx.state.topicName = await backend.gtcolumn_urlMap(ctx).then(data => {
    const map = data.master_special
    return map[topic]
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    return null
  })
  if (!ctx.state.topicName) {
    return await next()
  }

  if (!ctx.path.endsWith('/')) {
    ctx.status = 301
    ctx.redirect(ctx.path + '/' + ctx.search)
    return
  }

  ctx.state.scenePage = 'seo_' + ctx.state.topicName

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

  await ctx.render('zt_topic/zt_topic', ctx.state.renderData)
}