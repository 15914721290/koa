const backend = require('../../../foundation/backend')

module.exports = function(ctx) {
  return backend.seoplatform_getColumnList(ctx).then(data => {
    const score = data.score.list.map(value => value.column_name)
    const percent = data.percent.list.map(value => value.column_name)
    return {
      percent,
      score
    }
  }).catch(err => {
    console.error(ctx.url, err, ctx.header['referer'])
    return {
      percent: [],
      score: []
    }
  })
}