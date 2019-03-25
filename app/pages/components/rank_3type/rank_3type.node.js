const backend = require('../../../foundation/backend')
const converter = require('../../../foundation/DataConverter')

module.exports = ctx => {
  const orders = ['score', 'search', 'click']
  return backend.rank3Type(ctx, orders).then(data => {
    const zjpj = data.score.list.map(data => ({
      name: data.platform_name,
      href: converter.convertSecondDomain(ctx, data.platform_name_en) + '/',
      score: data.platform_score,
    }))
    const rmss = data.search.list.map(data => ({
      name: data.platform_name,
      href: converter.convertSecondDomain(ctx, data.platform_name_en) + '/',
      search: data.search_num,
    }))
    const rqzs = data.click.list.map(data => ({
      name: data.platform_name,
      href: converter.convertSecondDomain(ctx, data.platform_name_en) + '/',
      click: data.click_num > 1000000 ? '1000000+' : data.click_num
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