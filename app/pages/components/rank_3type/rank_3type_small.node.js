const backend = require('../../../foundation/backend')
const converter = require('../../../foundation/DataConverter')

module.exports = async ctx => {
  const orders = ['score', 'search', 'click']
  return backend.rank3Type(ctx, orders).then(data => {
    const zjpj = data.score.list.map(data => ({
      name: data.platform_name,
      href: converter.convertSecondDomain(ctx, data.platform_name_en) + '/',
    }))
    const rmss = data.search.list.map(data => ({
      name: data.platform_name,
      href: converter.convertSecondDomain(ctx, data.platform_name_en) + '/',
    }))
    const rqzs = data.click.list.map(data => ({
      name: data.platform_name,
      href: converter.convertSecondDomain(ctx, data.platform_name_en) + '/',
    }))
    return {
      zjpj,
      rmss,
      rqzs
    }
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    return {
      zjpj: [],
      rmss: [],
      rqzs: []
    }
  })
}