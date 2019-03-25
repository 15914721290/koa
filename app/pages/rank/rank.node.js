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
              current: value.content_name === '排行榜'
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
  filterList: ctx => {
    return backend.seoplatform_getColumnList(ctx)
      .then(data => {
        const list = []
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        {
          const filters = []
          for (let i = year; i >= 2018; --i) {
            for (let j = 12; j >= 1; --j) {
              if (i === year && j > month) {
                continue
              }
              if (i === 2018 && j < 4) {
                break
              }
              let array = [year, month, 0, 0, 0, 1]
              array[0] = i
              array[1] = j
              const join = array.join('-')
              filters.push({
                name: `${i}年${j}月`,
                href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
              })
            }
          }
          list.push({
            name: '榜单周期',
            filters
          })
        }

        {
          let filters = []
          let array = [year, month, 0, 0, 0, 1]
          array[2] = 0
          const join = array.join('-')
          filters.push({
            name: '不限',
            href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
          })
          data.score.list.forEach((value, index) => {
            let array = [year, month, 0, 0, 0, 1]
            array[2] = index + 1
            const join = array.join('-')
            filters.push({
              name: value.column_name,
              href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
            })
          })

          list.push({
            name: '评级限制',
            filters
          })
        }

        {
          let filters = []
          let array = [year, month, 0, 0, 0, 1]
          array[3] = 0
          const join = array.join('-')
          filters.push({
            name: '不限',
            href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
          })
          data.percent.list.forEach((value, index) => {
            let array = [year, month, 0, 0, 0, 1]
            array[3] = index + 1
            const join = array.join('-')
            filters.push({
              name: value.column_name,
              href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
            })
          })

          list.push({
            name: '收益限制',
            filters
          })
        }

        {
          let filters = []
          let array = [year, month, 0, 0, 0, 1]
          array[4] = 0
          const join = array.join('-')
          filters.push({
            name: '不限',
            href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
          })
          data.context.list.forEach((value, index) => {
            let array = [year, month, 0, 0, 0, 1]
            array[4] = index + 1
            const join = array.join('-')
            filters.push({
              name: value.column_name,
              href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
            })
          })

          list.push({
            name: '背景限制',
            filters
          })
        }
        return list
      }).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return []
      })
  },
  scoreRanks: ctx => {
    const scores = {'重仓': 1, '中仓': 2, '轻仓': 3}
    return backend.scoreRanks(ctx, Object.keys(scores)).then(data => {
      const result = []
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      Object.keys(scores).forEach(value => {
        const list = data[value].list
        if (list) {
          const items = data[value].list.map(item => ({
            name: item.platform_name,
            href: converter.convertSecondDomain(ctx, item.platform_name_en) + '/',
            rebate: item.rebate_year_change
          }))
          result.push({
            score: value,
            items,
            more: `${ctx.state.wwwOrigin}/rank/${year}-${month}-${scores[value]}-0-0-1.html`
          })
        }
      })
      return result
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    })
  },
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
  currentMonth: () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    return `${year}年${month}月`
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
  await ctx.render('rank/rank', ctx.state.renderData)
}