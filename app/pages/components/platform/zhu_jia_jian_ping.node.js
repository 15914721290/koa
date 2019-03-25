const util = require('../../../foundation/util')

module.exports = ctx => {
  const {
    detail,
    detail: {
      simple_test
    }
  } = ctx.state
  if (!detail) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  return {
    // 评测内容
    test_info: simple_test && simple_test.test_info || '',
    // 评测时间
    test_time: simple_test && simple_test.test_time && util.formatTime_YYYYMMDD(simple_test.test_time) || '',
    isOlderThan3Month: simple_test && simple_test.test_time && util.dateDiff(simple_test.test_time*1000).lt3Month || false
  }
}