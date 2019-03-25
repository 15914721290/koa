const backend = require('../../../foundation/backend')
const converter = require('../../../foundation/DataConverter')

module.exports = function (ctx) {
  return backend
    .gtcustomscene_info(ctx, {
      scene_page: 'seo_index'
    })
    .then(data => {
      let list = data.scene_info.scene_block.seo_index_rmpt.block_child_list
      let keys = Object.keys(list)
      let items = keys.map(key => {
        const block = list[key]
        let platforms = block.block_content.map(p => {
          return {
            name: p.content_name,
            url: converter.convertContentUrl(ctx, p.content_url),
            rate: p.content_intro
          }
        })
        return {
          title: block.block_name,
          platforms
        }
      })
      return items
    })
    .catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
}