const backend = require('../foundation/backend')
const CONSTANT = require('../foundation/constant')
const util = require('../foundation/util')
const converter = require('../foundation/DataConverter')
const moment = require('moment')

module.exports.get_breadcrumb_platform_url = ctx => {
  // :process.env
  // return process.env.NODE_ENV === 'production' ? ctx.state.origin + '/' : ctx.state.baseUrl
  return ctx.state.baseUrl
}

const ser_gtnews_list = module.exports.ser_gtnews_list = async function (ctx, platform_id, pageIndex, page_size) {
  const param = {
    column_id: 'news_wd_ptdt',
    pf_id: platform_id || ctx.state.detail.platform_id,
    order: 'time',
    page_index: pageIndex || ctx.state.pageIndex - 1
  }
  if (page_size != undefined) param.page_size = page_size
  ctx.state.newsList = await backend.gtnews_list(ctx, param).catch(err => {
    return util.errorHandler(CONSTANT.ERR_PLATFORM, err, ctx, {})
  })
}

const ser_set_ptdt = module.exports.ser_set_ptdt = ctx => {
  try {
    const items = []
    ctx.state.newsList.total > 0 && ctx.state.newsList.list.forEach(item => {
      items.push({
        title: item.news_title,
        intro: item.news_intro,
        img: item.news_img,
        href: `${ctx.state.wwwOrigin}/news/${item.news_id}.html`,
        time: converter.convertTimestamp(item.start_time, true),
        labels: converter.convertLabels(ctx, item.news_label),
        shortTime:converter.convertTimestamp(item.start_time, false)
      })
    })
    return items
  } catch (err) {
    return util.errorHandler(CONSTANT.ERR_PLATFORM, err, ctx, [])
  }
}

module.exports.use_api_post_topicContent = (ctx, platform_name) => {
  return backend
    .post_topicContent(ctx, {
      'page_index': 0,
      'page_size': 10,
      'topic_name': '深度测评',
      'search_content': platform_name
    })
    .then(data => {
      return data.list && data.list.map(item => {
        return {
          // 标题
          post_title: item.post_title,
          // 上线时间
          post_online_time: util.formatTime_YYYYMMDD(item.post_online_time)
        }
      }) || []
    })
    .catch(err => {
      return util.errorHandler(CONSTANT.ERR_PLATFORM, err, ctx, [])
    })
}


module.exports.ptylzz = async ctx => {
  const {
    detail,
    baseUrl
  } = ctx.state
  if (!detail || !baseUrl) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  await ser_gtnews_list(ctx, ctx.state.platform_id, 0, CONSTANT.showNumber)
  const result = await ser_set_ptdt(ctx)
  return {
    list:result,
    more_url: `${baseUrl}/guanfang/`,
    total: ctx.state.newsList.total,
    displayTotal: ctx.state.newsList.total > 99 ? '99+' : ctx.state.newsList.total
  }
}


module.exports.ptwd = ctx => {
  const {
    detail,
    detail: {
      platform_name
    }
  } = ctx.state
  if (!detail) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  return backend
    .post_maxlike(ctx, {
      'platform_name': platform_name,
      'order': 'like',
      'limit': 1
    })
    .then(data => {
      const re = data && data.list && data.list.map(item => {
        return {
          // 标题
          post_title: item.post_question_info.post_title,
          // 内容
          post_content: item.post_content,
          // 上线时间
          post_online_time: util.get_post_online_time(item.post_online_time),
          // 赞数量
          post_like_num: item.post_like_num,
          // 评论数
          post_comment_num: item.post_comment_num
        }
      }).slice(0, CONSTANT.showNumber) || []
      return {
        list: re,
        total: data.total,
        displayTotal: data.total > 99 ? '99+' : data.total
      }
    })
    .catch(err => {
      return util.errorHandler(CONSTANT.ERR_PLATFORM,err, ctx, {})
    })
}


module.exports.tydp = ctx => {
  const {
    detail,
    detail: {
      platform_id
    }
  } = ctx.state
  if (!detail) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  return backend
    .comment_listPlatform(ctx, {
      'page_index': '0',
      'page_size': CONSTANT.showNumber,
      'platform_id': platform_id,
      'type': 1
    })
    .then(data => {
      const list = data.list && data.list.map(item => {
        const it = {
          user_icon: item.user_info && item.user_info.user_icon || '/image/user_icon_default.png',
          user_name: item.user_info && item.user_info.user_name || '匿名',
          comment_pf_pop: CONSTANT.Enme_comment_pf_pop[item.comment_pf_pop].displayName,
          comment_pf_pop_css: CONSTANT.Enme_comment_pf_pop[item.comment_pf_pop].css,
          comment_content: item.comment_content,
          comment_label_info: item.comment_label_info && item.comment_label_info.length !== 0 && item.comment_label_info.filter(o=>o) || [],
          comment_add_time: moment(item.comment_add_time * 1000).format('YYYY-MM-DD HH:mm'),
        }
        return it
      }) || []
      return {
        total: data.total,
        displayTotal: data.total > 99 ? '+99' : data.total,
        list: list,
        comment_praise: data && data.platform_comment_info && data.platform_comment_info.platform_stat_info && data.platform_comment_info.platform_stat_info.comment_praise || ''
      }
    })
    .catch(err => {
      return util.errorHandler(CONSTANT.ERR_PLATFORM,err, ctx, [])
    })
}