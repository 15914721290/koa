const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')

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
  zttj: ctx => {
    return backend.gtcustomscene_info(ctx, {
      scene_page: 'seo_special_index'
    }).then(data => {
      const content = data.scene_info.scene_block.seo_special_zttj.block_content
      const items = content.map(item => ({
        title: item.content_name,
        intro: item.content_intro,
        img: item.content_icon,
        href: converter.convertContentUrl(ctx, item.content_url),
        date: converter.convertTimestamp(item.content_start_time),
        subject: {
          href: converter.convertContentUrl(ctx, item.content_child_list[0].content_url),
          inner: item.content_child_list[0].content_name
        }
      }))
      return items
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  subjectBlocks: ctx => {
    return backend.gtspecial_getSpecialAllList(ctx).then(data => {
      const blocks = data.map(block => {
        const subjects = block.special_list.map(subject => ({
          text: subject.scene_name,
          img: subject.scene_icon,
          href: `${ctx.state.wwwOrigin}/zt/${subject.scene_map}.html`
        }))
        return {
          title: block.column_name,
          more: `${ctx.state.wwwOrigin}/zt/${block.url_map}/`,
          subjects
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

  await ctx.render('zt/zt', ctx.state.renderData)
}