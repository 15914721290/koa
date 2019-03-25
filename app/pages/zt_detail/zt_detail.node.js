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
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/zt/`,
      inner: '专题'
    }, {
      href: ctx.state.renderData.parent.href,
      inner: ctx.state.renderData.parent.inner
    }, {
      inner: ctx.state.renderData.title
    }]
  }
}

module.exports = async (ctx, next) => {
  const data = await backend.gtspecial_info(ctx, {
    scene_page: ctx.params.id
  }).then(data => {
    const info = data.scene_info
    const blocks = Object.values(info.scene_block)
    const newsBlock = blocks[0]
    const baikeBlock = blocks[1]
    const baikeContent = baikeBlock.block_content
    const baike1 = baikeContent[0]
    const baike2and3 = baikeContent.slice(1, 3)
    const baikeOther = baikeContent.slice(3)
    const result = {
      seo_key: info.seo_key,
      seo_desc: info.seo_desc,
      title: info.scene_name,
      intro: info.scene_intro,
      bg: info.scene_bg_img,
      news: {
        title: newsBlock.block_name,
        items: newsBlock.block_content.map(item => ({
          img: item.content_icon,
          href: converter.convertContentUrl(ctx, item.content_url),
          title: item.content_name,
          intro: item.content_intro
        }))
      },
      baike: {
        title: baikeBlock.block_name,
        big: {
          img: baike1.content_icon,
          href: converter.convertContentUrl(ctx, baike1.content_url),
          text: baike1.content_name
        },
        two: baike2and3.map(item => ({
          img: item.content_icon,
          href: converter.convertContentUrl(ctx, item.content_url),
          text: item.content_name
        })),
        others: baikeOther.map(item => ({
          href: converter.convertContentUrl(ctx, item.content_url),
          inner: item.content_name
        }))
      },
      parent: {
        href: converter.convertByUrlMap(ctx, info.level.column_en_name),
        inner: info.level.column_name
      }
    }

    const ztBlock = blocks[2] // 需求确认可以没有
    if (ztBlock) {
      result.zt =  {
        title: ztBlock.block_name,
        items: ztBlock.block_content.map(item => ({
          text: item.content_name,
          href: converter.convertContentUrl(ctx, item.content_url),
          img: item.content_icon
        }))
      }
    }
    return result
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    if (err === '专题不存在') {
      ctx.state.is404 = true
    }
    return {}
  })

  if (ctx.state.is404) {
    return await next()
  }

  if (data) {
    Object.assign(ctx.state.renderData, data)
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

  await ctx.render('zt_detail/zt_detail', ctx.state.renderData)
}