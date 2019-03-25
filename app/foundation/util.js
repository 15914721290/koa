const moment = require('moment')
const CONSTANT = require('./constant')


const formatTime_YYYYMMDD = module.exports.formatTime_YYYYMMDD = time => {
  return moment(time * 1000).format('YYYY-MM-DD')
}

module.exports.formatTime_YYYYMMDD_HHmm = time => {
  return moment(time * 1000).format('YYYY-MM-DD HH:mm')
}


/* eslint-disable */
const dateDiff = module.exports.dateDiff = function (hisTime, nowTime) {
  if (!arguments.length) return ''
  const arg = arguments
  const now = arg[1] ? arg[1] : new Date().getTime()
  const diffValue = now - arg[0]
  let result = ''

  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const halfamonth = day * 15
  const month = day * 30
  const year = month * 12

  const _year = diffValue / year
  const _month = diffValue / month
  const _week = diffValue / (7 * day)
  const _day = diffValue / day
  const _hour = diffValue / hour
  const _min = diffValue / minute


  if (_year >= 1) result = parseInt(_year) + '年前'
  else if (_month >= 1) result = parseInt(_month) + '个月前'
  else if (_week >= 1) result = parseInt(_week) + '周前'
  else if (_day >= 1) result = parseInt(_day) + '天前'
  else if (_hour >= 1) result = parseInt(_hour) + '个小时前'
  else if (_min >= 1) result = parseInt(_min) + '分钟前'
  else result = '刚刚'

  return {
    displayName: result,
    timeStamp: hisTime,
    ltMonth: moment(hisTime).add('1', 'months').valueOf() < Date.now(),
    lt3Month: moment(hisTime).add('3', 'months').valueOf() < Date.now()
  }
}
/* eslint-enable */


module.exports.errorHandler = function (KEY, err, ctx, defaultValue) {
  // :process env
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'local') {
    throw err
  } else {
    try {
      if (KEY === CONSTANT.ERR_PLATFORM) {
        console.error(ctx.url, err, ctx.header['referer'])
        return defaultValue
      }
    } catch (error) {
      return defaultValue
    }
  }
}

module.exports.get_post_online_time = function (time) {
  const dd = dateDiff(time * 1000)
  return dd.ltMonth ? formatTime_YYYYMMDD(time) : dd.displayName
}

const o = module.exports.o = function (func) {
  try {
    return func()
  } catch (error) {
    return undefined
  }
}

module.exports.getAd_mark = function (action, data) {
  const mapingAdTable = {
    // 资讯 - 网贷栏目
    news_wd: { pKey: 'seo_ad_2.6' },
    // 资讯 - 网贷栏目 - 分类 - 网贷新闻
    news_wd_wdxw: { pKey: 'seo_ad_2.6.1', dKey_pc: 'seo_ad_6-1', dKey_m: 'seo_ad_6-7' },
    // 资讯 - 网贷栏目 - 分类 - 平台动态
    news_wd_ptdt: { pKey: 'seo_ad_2.6.2', dKey_pc: 'seo_ad_6-2', dKey_m: 'seo_ad_6-8' },
    // 资讯 - 网贷栏目 - 分类 - 跟投精选
    news_wd_gtjx: { pKey: 'seo_ad_2.6.3', dKey_pc: 'seo_ad_6-3', dKey_m: 'seo_ad_6-9' },
    // 资讯 - 网贷栏目 - 分类 - 专家专栏
    news_wd_zjzl: { pKey: 'seo_ad_2.6.4', dKey_pc: 'seo_ad_6-4', dKey_m: 'seo_ad_6-10' },
    // 资讯 - 网贷栏目 - 分类 - 专家评测
    news_wd_zjcp: { pKey: 'seo_ad_2.6.5', dKey_pc: 'seo_ad_6-5', dKey_m: 'seo_ad_6-11' },
    // 文章详情公众号广告位
    platform_type: {
      '可投平台': {
        gzh: [
          { gKey: 'seo_ad_6.1-1', des: 'pc' },
          { gKey: 'seo_ad_6.1-6', des: 'm' },
        ],
        detail: [
          { gKey: 'seo_ad_5.1-1', des: 'pc' },
          { gKey: 'seo_ad_5.1-6', des: 'm' },
        ]
      },
      '观望平台': {
        gzh: [
          { gKey: 'seo_ad_6.1-2', des: 'pc' },
          { gKey: 'seo_ad_6.1-7', des: 'm' },
        ],
        detail: [
          { gKey: 'seo_ad_5.1-2', des: 'pc' },
          { gKey: 'seo_ad_5.1-7', des: 'm' },
        ]
      },
      '黑名单': {
        gzh: [
          { gKey: 'seo_ad_6.1-3', des: 'pc' },
          { gKey: 'seo_ad_6.1-8', des: 'm' },
        ],
        detail: [
          { gKey: 'seo_ad_5.1-3', des: 'pc' },
          { gKey: 'seo_ad_5.1-8', des: 'm' },
        ]
      },
      '停止运营': {
        gzh: [
          { gKey: 'seo_ad_6.1-4', des: 'pc' },
          { gKey: 'seo_ad_6.1-9', des: 'm' },
        ],
        detail: [
          { gKey: 'seo_ad_5.1-4', des: 'pc' },
          { gKey: 'seo_ad_5.1-9', des: 'm' },
        ]
      },
      'default': {
        gzh: [
          { gKey: 'seo_ad_6.1-5', des: 'pc', isDefault:true },
          { gKey: 'seo_ad_6.1-10', des: 'm', isDefault:true },
        ],
        detail: [
          { gKey: 'seo_ad_5.1-5', des: 'pc', isDefault:true },
          { gKey: 'seo_ad_5.1-10', des: 'm', isDefault:true },
        ]
      }
    },
    gtfl: {
      pKey: 'seo_ad_6.2',
      items: ['seo_ad_6.2-1', 'seo_ad_6.2-2', 'seo_ad_6.2-3']
    }
  }
  if (action === 'isArticle') {
    return mapingAdTable[data] || { dKey_pc: 'seo_ad_6-6', dKey_m: 'seo_ad_6-12' }
  } else if (action === 'is_platform_type') {
    const re = []
    Array.prototype.push.apply(re,o(()=>mapingAdTable.platform_type[data].gzh) || [])
    Array.prototype.push.apply(re,mapingAdTable.platform_type.default.gzh)
    re.forEach(o=>{
      if(o.isDefault===undefined){
        o.isDefault = false
      }
    })
    return re
  } else if (action === 'is_platform_detail') {
    const item = data ? mapingAdTable.platform_type[data] : undefined
    return {
      isDefault: item ? false : true,
      detail: item ? item.detail : mapingAdTable.platform_type.default.detail
    }
  } else if ( action === 'is_gtfl') {
    return mapingAdTable.gtfl
  } else if (action === 'normal') {
    return mapingAdTable[data] || undefined
  }else {
    return undefined
  }
}