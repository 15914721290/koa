const backend = require('../../../foundation/backend')
const converter = require('../../../foundation/DataConverter')

module.exports = ctx => {
  return backend
    .seoplatform_getLinks(ctx)
    .then(data => {
      const items = data.list.map(value => {
        const children = value.nextContent.map(child => {
          return {
            inner: child.content_name,
            href: converter.convertContentUrl(ctx, child.content_url, true)
          }
        })
        return {
          title: value.content_name,
          children
        }
      })
      // 只有首页才有友情链接
      if (ctx.path === '/') {
        return items
      } else {
        return items.filter(item => item.title != '友情链接')
      }
    })
    .catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
}