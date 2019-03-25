const { showNumber } = require('../../../foundation/constant')

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
    // 其它来源评测 测评追踪
    other_source: depth_test && depth_test.other_source && depth_test.other_source.filter(o=>o.url).slice(0,showNumber)
  }
}