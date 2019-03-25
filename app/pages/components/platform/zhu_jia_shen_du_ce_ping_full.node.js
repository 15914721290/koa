// const moment = require('moment')
const { formatTime_YYYYMMDD } = require('../../../foundation/util')

module.exports = ctx => {
  const {
    detail,
    detail: {
      depth_test
    }
  } = ctx.state
  if (!detail) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  return {
    // 测评标题
    test_title: depth_test && depth_test.test_title || '',
    // 评测内容
    test_info: depth_test && depth_test.test_info || '',
    // 评测时间
    test_time: depth_test && depth_test.test_time &&  formatTime_YYYYMMDD(depth_test.test_time) || ''
  }
}