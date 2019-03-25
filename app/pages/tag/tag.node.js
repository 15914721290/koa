const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const numUtils = require('../../foundation/NumberUtils')

const kPageSize = 15

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
  tagList: ctx => {
    const items = ctx.state.tagInfo.list.map(item => ({
      img: item.icon,
      href: `${ctx.state.wwwOrigin}/${item.type}/${item.original_id}.html`,
      title: item.title,
      intro: item.intro,
      time: converter.convertTimestamp(item.publish_time, true),
      labels: converter.convertLabels(ctx, item.news_label)
    }))
    return items
  },
  breadcrumb: ctx => {
    return [{
      inner: ctx.state.tagInfo.tag
    }]
  },
  tagName: ctx => ctx.state.tagInfo.tag,
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
  jrtt: ctx => {
    return backend
      .gtcustomscene_info(ctx, {
        scene_page: 'seo_index'
      })
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
  pagination: ctx => {
    return converter.convertPagination(
      `${ctx.state.wwwOrigin}/tag/${ctx.params.tag}`,
      ctx.state.pageIndex,
      kPageSize,
      ctx.state.tagInfo.total)
  },
  related: ctx => {
    return backend.tag_tagRecommend(ctx, {
      tag_map: ctx.params.tag
    }).then(data => {
      return data.tag_relation.map(item => ({
        inner: item.tag_name,
        href: `${ctx.state.wwwOrigin}/tag/${item.tag_map}/`,
      }))
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  tjyd: ctx => {
    return backend.tag_tagRecommend(ctx, {
      tag_map: ctx.params.tag
    }).then(data => {
      return data.list.map(item => ({
        img: item.icon,
        href: `${ctx.state.wwwOrigin}/${item.type}/${item.original_id}.html`,
        text: item.title
      }))
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  shortTitle: ctx => ctx.state.tagInfo.short_title
}

module.exports = async (ctx, next) => {
  const page = ctx.params.page || '1'
  if (!numUtils.isNonNegativeInteger(page) || page < 1) {
    return await next()
  }
  ctx.state.pageIndex = parseInt(page)

  ctx.state.tagInfo = await backend.tag_tagPageList(ctx, {
    tag_id: ctx.params.tag,
    page_index: ctx.state.pageIndex - 1,
    page_size: kPageSize
  }).catch(err => {
    console.error(ctx.url, err, ctx.header.referer, ctx.header['user-agent'])
    return null
  })

  if (!ctx.state.tagInfo) {
    return await next()
  }

  const maxPage = Math.ceil(ctx.state.tagInfo.total / kPageSize) || 1
  if (ctx.state.pageIndex > maxPage) {
    console.log(`visit ${ctx.url} while max = ${maxPage}`)
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

  await ctx.render('tag/tag', ctx.state.renderData)
}