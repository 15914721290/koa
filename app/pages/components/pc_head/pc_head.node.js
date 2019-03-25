const backend = require('../../../foundation/backend')
const converter = require('../../../foundation/DataConverter')

module.exports = ctx => {
  return Promise.all([
    backend.seoplatform_list(ctx, {
      page_index: 0,
      page_size: 20,
      order: 'recom'
    }),
    backend.gtcustomscene_info(ctx, {
      scene_page: 'common'
    }),
    backend.gtspecial_getSpecialAllList(ctx)
  ]).then(data => {
    const platforms = data[0].list.map(item => ({
      name: item.platform_name,
      href: converter.convertSecondDomain(ctx, item.platform_name_en) + '/'
    }))
    const block = data[1].scene_info.scene_block
    const news = block.seo_news_menu.block_content.map(item => ({
      name: item.content_name,
      href: converter.convertContentUrl(ctx, item.content_url, true),
      subs: item.content_child_list.map(c => ({
        name: c.content_name,
        href: converter.convertContentUrl(ctx, c.content_url, true)
      }))
    }))
    const baike = block.seo_wiki_menu.block_content.map(item => ({
      name: item.content_name,
      href: converter.convertContentUrl(ctx, item.content_url, true)
    }))
    const zt = data[2].map(item => ({
      name: item.column_name,
      href: `${ctx.state.wwwOrigin}/zt/${item.url_map}/`
    }))
    return {
      platforms,
      news,
      baike,
      zt
    }
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    return {}
  })
}