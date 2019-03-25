const backend = require('../../../foundation/backend')
const converter = require('../../../foundation/DataConverter')

module.exports = ctx => {
  return backend
    .gtcustomscene_info(ctx, {
      scene_page: 'common'
    })
    .then(content => {
      const items = content.scene_info.scene_block.seo_search_hot.block_content.map(item => {
        return {
          inner: item.content_name,
          href: converter.convertContentUrl(ctx, item.content_url, true)
        }
      })
      return items
    })
    .catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
}