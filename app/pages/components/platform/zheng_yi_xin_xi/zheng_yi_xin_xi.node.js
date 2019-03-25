const util = require('../../../../foundation/util')
const CONSTANT = require('../../../../foundation/constant')

function get_content_url(info) {
  // const checkType = [
  //   CONSTANT.Post_Type.QUESTION,
  //   CONSTANT.Post_Type.ANSER,
  //   CONSTANT.Post_Type.DISCUSS
  // ]
  if (info.content_url && info.content_url.length !== 0) {
    return info.content_url.map(item => {
      if (item.type == CONSTANT.Post_Type.HTTP_Link && item.title) {
        // 协议跳转
        return {
          type: item.type,
          title: item.title
        }
      } else if (item.post_info && item.post_info.post_type && item.post_info.post_type == CONSTANT.Post_Type.QUESTION) {
        // 问题
        if (!item.post_info.post_best_answer_info || !item.post_info.post_best_answer_info.post_content) {
          return {
            type: null
          }
        } else {
          const post = item.post_info.post_best_answer_info
          return {
            type: item.post_info.post_type,
            title: item.post_info.post_title,
            content: post && post.post_content || '',
            time: post && post.post_online_time && util.get_post_online_time(post.post_online_time) || '',
            like: post && post.post_like_num || '0',
            comment: post && post.post_comment_num || '0'
          }
        }
      } else if (item.post_info && item.post_info.post_type && item.post_info.post_type == CONSTANT.Post_Type.ANSER) {
        // 回答
        if (!item.post_info.post_question_info || !item.post_info.post_question_info.post_title) {
          return {
            type: null
          }
        } else {
          const post = item.post_info.post_question_info
          return {
            type: item.post_info.post_type,
            title: post.post_title,
            content: item.post_info.post_content || '',
            time: item.post_info.post_online_time && util.get_post_online_time(item.post_info.post_online_time) || '',
            like: item.post_info.post_like_num || '0',
            comment: item.post_info.post_comment_num || '0'
          }
        }
      } else if (item.post_info && item.post_info.post_type && item.post_info.post_type == CONSTANT.Post_Type.DISCUSS) {
        // 讨论
        if (!item.post_info.post_title) {
          return {
            type: null
          }
        } else {
          const post = item.post_info
          return {
            type: post.post_type,
            title: post.post_title,
            content: post.post_content || '',
            time: post.post_online_time && util.get_post_online_time(post.post_online_time) || '',
            like: post.post_like_num || '0',
            comment: post.post_comment_num || '0'
          }
        }
      } else if (item.post_info && item.post_info.post_type && item.post_info.post_type == CONSTANT.Post_Type.ARTICLE) {
        // 文章
        const post = item.post_info
        return {
          type: post.post_type,
          title: post.post_title,
          // content: post && post.post_content || '',
          image_url: post.post_image || '/image/default.png',
          time: post && post.post_online_time && util.get_post_online_time(post.post_online_time) || '',
          // like: post && post.post_like_num || '0',
          // comment: post && post.post_comment_num || '0'
          read: post && post.post_read_num || '0'
        }
      } else {
        return {
          type: null
        }
      }
    })
  } else {
    return []
  }
}

function get_black_time(info, black_info) {
  if (info === black_info) {
    if (info.black_time) {
      return util.formatTime_YYYYMMDD_HHmm(info.black_time)
    } else {
      return '-'
    }
  } else {
    if (info.dispute_time) {
      return util.formatTime_YYYYMMDD_HHmm(info.dispute_time)
    } else {
      return '-'
    }
  }
}

module.exports = ctx => {
  const {
    detail,
    detail: {
      black_info,
      dispute_info,

    }
  } = ctx.state
  if (!detail) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  try {
    const hasInfo = (black_info && black_info.platform_id && true) || (dispute_info && dispute_info.platform_id && true)
    if (hasInfo) {
      const info = hasInfo && black_info ? black_info : dispute_info
      const re = {
        hasInfo,
        title: info === black_info ? '黑名单' : '争议信息',
        // 争议原因
        dispute_info: info === black_info ?  '' : info.dispute_info || '',
        // 黑名单 违约信息
        black_info: info === black_info ? info.black_info || '' : '',
        // 黑名单原因
        black_reason: info === black_info ? info.black_reason || '' : '',
        black_time: get_black_time(info, black_info),
        content_url: get_content_url(info).filter(o => o.type !== null)
      }
      return re
    } else {
      return {
        hasInfo
      }
    }
  } catch (error) {
    return util.errorHandler(CONSTANT.ERR_PLATFORM, error, ctx, {
      hasInfo: false
    })
  }
}