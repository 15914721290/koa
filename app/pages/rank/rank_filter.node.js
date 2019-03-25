const backend = require('../../foundation/backend')
const converter = require('../../foundation/DataConverter')
const numUtils = require('../../foundation/NumberUtils')

const kPageSize = 10

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
    try {
      const list = []
      {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1
        const filters = []
        for (let i = year; i >= 2018; --i) {
          for (let j = 12; j >= 1; --j) {
            if (i === year && j > month) {
              continue
            }
            if (i === 2018 && j < 4) {
              break
            }
            let array = [...ctx.state.filters]
            array[0] = i
            array[1] = j
            array[5] = 1
            const join = array.join('-')
            filters.push({
              name: `${i}年${j}月`,
              href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
              isCurrent: i === ctx.state.filters[0] && j === ctx.state.filters[1]
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
        let array = [...ctx.state.filters]
        array[2] = 0
        array[5] = 1
        const join = array.join('-')
        filters.push({
          name: '不限',
          href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
          isCurrent: ctx.state.filters[2] === 0
        })
        ctx.state.conditions.score.list.forEach((value, index) => {
          let array = [...ctx.state.filters]
          array[2] = index + 1
          array[5] = 1
          const join = array.join('-')
          filters.push({
            name: value.column_name,
            href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
            isCurrent: ctx.state.filters[2] === array[2]
          })
        })

        list.push({
          name: '评级限制',
          filters
        })
      }

      {
        let filters = []
        let array = [...ctx.state.filters]
        array[3] = 0
        array[5] = 1
        const join = array.join('-')
        filters.push({
          name: '不限',
          href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
          isCurrent: ctx.state.filters[3] === 0
        })
        ctx.state.conditions.percent.list.forEach((value, index) => {
          let array = [...ctx.state.filters]
          array[3] = index + 1
          array[5] = 1
          const join = array.join('-')
          filters.push({
            name: value.column_name,
            href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
            isCurrent: ctx.state.filters[3] === array[3]
          })
        })

        list.push({
          name: '收益限制',
          filters
        })
      }

      {
        let filters = []
        let array = [...ctx.state.filters]
        array[4] = 0
        array[5] = 1
        const join = array.join('-')
        filters.push({
          name: '不限',
          href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
          isCurrent: ctx.state.filters[4] === 0
        })
        ctx.state.conditions.context.list.forEach((value, index) => {
          let array = [...ctx.state.filters]
          array[4] = index + 1
          array[5] = 1
          const join = array.join('-')
          filters.push({
            name: value.column_name,
            href: `${ctx.state.wwwOrigin}/rank/${join}.html`,
            isCurrent: ctx.state.filters[4] === array[4]
          })
        })

        list.push({
          name: '背景限制',
          filters
        })
      }
      return list
    } catch(err) {
      console.error(ctx.url, err, ctx.header['referer'])
      return []
    }
  },
  hotSearch: require('../components/pc_hot_search/pc_hot_search.node'),
  filterResult: ctx => {
    const filters = ctx.state.filters
    let result = `${filters[0]}年${filters[1]}月`
    if (filters[2] > 0) {
      result += '评级' + ctx.state.conditions.score.list[filters[2] - 1].column_name
    }
    if (filters[3] > 0) {
      result += '收益' + ctx.state.conditions.percent.list[filters[3] - 1].column_name
    }
    if (filters[4] > 0) {
      result += ctx.state.conditions.context.list[filters[4] - 1].column_name
    }
    return result
  },
  platforms: ctx => {
    let items = []
    if (ctx.state.rankData.list) {
      items = ctx.state.rankData.list.map((item, index) => {
        const score_num = {
          无: 0,
          重仓: 1,
          中仓: 2,
          轻仓: 3,
          观望: 4
        } [item.platform_score] || 0
        const rebate_num = {
          '21': 1,
          '5': 2,
          '6': 3,
          '7': 4,
          '8': 5
        } [item.rebate_year_change_id] || 0
        const www = ctx.state.wwwOrigin
        return {
          img: item.platform_icon,
          href: converter.convertSecondDomain(ctx, item.platform_name_en),
          rank: 10 * (ctx.state.pageIndex - 1) + (index + 1),
          name: item.platform_name,
          rebate: item.rebate_year_change,
          rebateHref: `${www}/p2p/0-${rebate_num}-0-0-0-0-0-0-1.html`,
          score: item.platform_score,
          scoreHref: `${www}/p2p/${score_num}-0-0-0-0-0-0-0-1.html`,
          state: item.operation_state,
          stateHref: `${www}/p2p/0-0-0-0-0-0-${item.operation_state_id}-0-1.html`,
        }
      })
    }
    return items
  },
  pagination: ctx => {
    let array = [...ctx.state.filters]
    array.pop()
    const join = array.join('-') + '-'
    return converter.convertHtmlPagination(`${ctx.state.wwwOrigin}/rank/${join}`,
      ctx.state.pageIndex, kPageSize, ctx.state.rankData.total)
  },
  breadcrumb: ctx => {
    return [{
      href: `${ctx.state.wwwOrigin}/rank/`,
      inner: '排行榜'
    }, {
      inner: 'P2P网贷平台排名'
    }]
  }
}

module.exports = async (ctx, next) => {
  if (ctx.state.is404) {
    return await next()
  }

  const filters = ctx.params.filter.split('-')
  // 前5位是筛选条件，第6位是页码。
  if (filters.length !== 6) {
    return await next()
  }

  for (let i = 0; i < filters.length; i += 1) {
    if (!numUtils.isNonNegativeInteger(filters[i])) {
      return await next()
    } else {
      filters[i] = parseInt(filters[i])
    }
  }

  if (filters[5] < 1) {
    return await next()
  }

  const now = new Date()
  const year = now.getFullYear()
  if (filters[0] < year) {
    return await next()
  }

  if (filters[1] < 1 || filters[1] > 12) {
    return await next()
  }

  if (filters[0] === 2018 && filters[1] < 4) {
    return await next()
  }

  ctx.state.conditions = await backend.seoplatform_getColumnList(ctx)
    .catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      // Note:出错咋办？除了404外，应该还有个服务器错误的页面
    })

  if (filters[2] > ctx.state.conditions.score.length ||
    filters[3] > ctx.state.conditions.percent.length ||
    filters[4] > ctx.state.conditions.context.length) {
    return await next()
  }

  let month = filters[1]
  if (month < 10) {
    month = '0' + month
  }
  const params = {
    date: `${filters[0]}${month}`,
    page_index: filters[5] - 1,
    page_size: kPageSize,
  }
  if (filters[2] > 0) {
    params.score = ctx.state.conditions.score.list[filters[2] - 1].column_id
  }
  if (filters[3] > 0) {
    params.percent = ctx.state.conditions.percent.list[filters[3] - 1].column_id
  }
  if (filters[4] > 0) {
    params.context = ctx.state.conditions.context.list[filters[4] - 1].column_id
  }

  ctx.state.filters = filters
  ctx.state.params = params

  ctx.state.rankData = await backend.seoplatform_platformRank(ctx, ctx.state.params)

  ctx.state.pageIndex = filters[5]
  const maxPage = Math.ceil(ctx.state.rankData.total / kPageSize) || 1
  if (ctx.state.pageIndex > maxPage) {
    console.log(`visit ${ctx.url} while max = ${maxPage}`)
    return await next()
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

  await ctx.render('rank/rank_filter', ctx.state.renderData)
}