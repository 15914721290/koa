const kUrlMap = {}
const backend = require('./backend')

module.exports = {
  prepareUrlMap: async ctx => {
    const map = await backend.gtcolumn_urlMap(ctx).catch(err => {
      console.error(err)
      return require('./default-url-map')
    })
    for (let key in map.master_news) {
      kUrlMap[map.master_news[key]] = '/news/' + key + '/'
    }
    for (let key in map.master_wiki) {
      kUrlMap[map.master_wiki[key]] = '/baike/' + key + '/'
    }
    for (let key in map.master_special) {
      kUrlMap[map.master_special[key]] = '/zt/' + key + '/'
    }
  },
  convertByUrlMap: (ctx, id) => ctx.state.wwwOrigin + kUrlMap[id],
  convertContentUrl: function(ctx, content_url, forceWwwOrigin = false) {
    if (!content_url) {
      return null
    }
    const {url, type} = content_url
    const origin = forceWwwOrigin ? ctx.state.wwwOrigin : ctx.state.origin
    switch (Number(type)) {
    case 888:
      if (url.startsWith('http')) {
        return url
      } else {
        return origin + url
      }
    case 2:
      return this.convertSecondDomain(ctx, content_url.url) + '/'
    case 4:
      return `${origin}/news/${url}.html`
    case 5:
      return `${origin}/baike/${url}.html`
    case 6:
      return `${origin}/zt/${url}/`
    default:
      console.error('unknown content_url type from ' + ctx.url)
      return `${origin}/`
    }
  },
  convertTimestamp: (timestamp, needTime = false) => {
    if (!timestamp) {
      return ''
    }
    const date = new Date(timestamp * 1000)
    const year = date.getFullYear()
    let month = date.getMonth() + 1
    if (month < 10) {
      month = '0' + month
    }
    let day = date.getDate()
    if (day < 10) {
      day = '0' + day
    }

    if (needTime) {
      let hour = `${date.getHours()}`
      if (hour < 10) {
        hour = '0' + hour
      }
      let minute = `${date.getMinutes()}`
      if (minute < 10) {
        minute = '0' + minute
      }
      let second = `${date.getSeconds()}`
      if (second < 10) {
        second = '0' + second
      }
      return `${year}-${month}-${day}  ${hour}:${minute}:${second}`
    }
    return `${year}-${month}-${day}`
  },
  convertPagination: (baseUrl, currentIndex, pageSize, total) => {
    const maxIndex = Math.ceil(total / pageSize)
    const first = `${baseUrl}/`
    let previous = null
    if (currentIndex >= 3) {
      previous = `${baseUrl}-${currentIndex - 1}/`
    } else if (currentIndex === 2) {
      previous = first
    }

    const nums = []
    for (let i = currentIndex - 2; i <= currentIndex + 2; ++i) {
      if (i >= 1 && i <= maxIndex) {
        nums.push({
          inner: i,
          href: i === 1 ? first : `${baseUrl}-${i}/`,
          isCurrent: currentIndex === i
        })
      }
    }

    const result = {
      show: maxIndex > 1,
      current: currentIndex,
      max: maxIndex,
      total,
      nums,
      first,
      last: `${baseUrl}-${maxIndex}/`,
      previous,
      next: currentIndex === maxIndex ? null : `${baseUrl}-${currentIndex + 1}/`
    }

    return result
  },
  convertHtmlPagination: (baseUrl, currentIndex, pageSize, total) => {
    const maxIndex = Math.ceil(total / pageSize)
    const first = `${baseUrl}1.html`
    let previous = null
    if (currentIndex >= 3) {
      previous = `${baseUrl}${currentIndex - 1}.html`
    } else if (currentIndex === 2) {
      previous = first
    }

    const nums = []
    for (let i = currentIndex - 2; i <= currentIndex + 2; ++i) {
      if (i >= 1 && i <= maxIndex) {
        nums.push({
          inner: i,
          href: i === 1 ? first : `${baseUrl}${i}.html`,
          isCurrent: currentIndex === i
        })
      }
    }

    const result = {
      show: maxIndex > 1,
      current: currentIndex,
      max: maxIndex,
      total,
      nums,
      first,
      last: `${baseUrl}${maxIndex}.html`,
      previous,
      next: currentIndex === maxIndex ? null : `${baseUrl}${currentIndex + 1}.html`
    }

    return result
  },
  convertQueryPagination: (baseUrl, currentIndex, pageSize, total) => {
    const maxIndex = Math.ceil(total / pageSize)
    const first = `${baseUrl}1`
    let previous = null
    if (currentIndex >= 3) {
      previous = `${baseUrl}${currentIndex - 1}`
    } else if (currentIndex === 2) {
      previous = first
    }

    const nums = []
    for (let i = currentIndex - 2; i <= currentIndex + 2; ++i) {
      if (i >= 1 && i <= maxIndex) {
        nums.push({
          inner: i,
          href: i === 1 ? first : `${baseUrl}${i}`,
          isCurrent: currentIndex === i
        })
      }
    }

    const result = {
      show: maxIndex > 1,
      current: currentIndex,
      max: maxIndex,
      total,
      nums,
      first,
      last: `${baseUrl}${maxIndex}`,
      previous,
      next: currentIndex === maxIndex ? null : `${baseUrl}${currentIndex + 1}`
    }

    return result
  },
  convertSecondDomain: (ctx, platformId) => {
    const origin = ctx.state.origin
    let result
    if (origin.indexOf('.com') != -1) {
      const toReplace = origin.substring(origin.indexOf('/') + 2, origin.indexOf('.'))
      result = origin.replace(toReplace, platformId)
    } else {
      result = `${origin}/internal/${platformId}`
    }
    return result
  },
  convertWwwDomain: (ctx) => {
    const origin = ctx.state.origin
    if (origin.indexOf('.com') != -1) {
      const toReplace = origin.substring(origin.indexOf('/') + 2, origin.indexOf('.'))
      const result = origin.replace(toReplace, 'www')
      return result
    } else {
      return origin
    }
  },
  convertAdBlock: function(ctx, block) {
    if (block) {
      return block.map(item => {
        // 运营是可以配置url为空的。
        const href = item.content_url && item.content_url.url.length > 0 && this.convertContentUrl(ctx, item.content_url)
        return {
          img: item.content_icon,
          href,
          // 只能写死了，不能用ctx.request.origin判断，因为有二级域名
          external: href && href.indexOf('51hjgt.com') === -1
        }
      })
    }
    return []
  },
  convertLabels: function(ctx, data) {
    const labels = []
    if (data) {
      data.platform && labels.push({
        inner: data.platform.platform_name,
        href: this.convertSecondDomain(ctx, data.platform.platform_name_en) + '/'
      })
      data.tag && data.tag.forEach(item => {
        labels.push({
          inner: item.tag_name,
          href: `${ctx.state.wwwOrigin}/tag/${item.tag_map}/`
        })
      })
    }
    return labels
  },
  convertQrcode: function(ctx, source){
    return `${ctx.state.wwwOrigin}/landingPage?source=${source}`
  }
}