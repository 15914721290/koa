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
              current: value.content_name === '平台地图'
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
  results: ctx => {
    const letter = ctx.query.letter
    const valid = letter && (/[A-Z]/.test(letter) || letter === '0-9')
    if (valid) {
      return backend.seoplatform_getPlatformLetter(ctx, {
        first_letter: letter,
        page_size: 1000
      }).then(data => {
        let items = []
        if (data && data[letter]) {
          items = data[letter].map(p => ({
            isHot: p.platform_index == 1,
            img: p.platform_icon,
            href: converter.convertSecondDomain(ctx, p.platform_name_en) + '/',
            title: p.platform_name
          }))
        }
        return items
      }).then(items => ({
        top20: items.slice(0, 20),
        others: items.slice(20)
      })).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          top20: [],
          others: []
        }
      })
    } else {
      return backend.seoplatform_list(ctx, {
        page_index: 0,
        page_size: 100,
        order: 'recom'
      }).then(data => {
        const items = []
        data.list.forEach(p => {
          if (p.platform_index == 1) {
            items.push({
              isHot: true,
              title: p.platform_name,
              img: p.platform_icon,
              href: converter.convertSecondDomain(ctx, p.platform_name_en) + '/'
            })
          }
        })
        return items
      }).then(items => ({
        top20: items.slice(0, 20),
        others: items.slice(20)
      })).catch(err => {
        console.error(ctx.url, err, ctx.header['referer'])
        return {
          top20: [],
          others: []
        }
      })
    }
  },
  platformMap: ctx => {
    return backend.seoplatform_platformMap(ctx).then(data => {
      const letterMap = {}
      const list = data.map(item => {
        if (letterMap[item.letter]) {
          letterMap[item.letter].push(item.province)
        } else {
          letterMap[item.letter] = [item.province]
        }
        const platforms = item.platform.map(p => ({
          inner: p.platform_name,
          href: converter.convertSecondDomain(ctx, p.platform_name_en) + '/'
        }))
        return {
          province: item.province,
          count: item.count,
          platforms
        }
      })

      return {
        letterMap,
        list
      }
    }).catch(err => {
      console.error(ctx.url, err, ctx.header['referer'])
      return {
        letterMap: {},
        list: []
      }
    })
  },
  alphabet: ctx => {
    const letter = ctx.query.letter
    const valid = letter && (/[A-Z]/.test(letter) || letter === '0-9')
    const items = [
      '0-9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ].map(letter => ({
      letter,
      href: `${ctx.state.wwwOrigin}/p2p-dh/?letter=${letter}`,
      current: ctx.query.letter === letter
    }))
    items.unshift({
      letter: '热门',
      href: `${ctx.state.wwwOrigin}/p2p-dh/`,
      current: !valid
    })
    return items
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

  await ctx.render('p2p_dh/p2p_dh', ctx.state.renderData)
}