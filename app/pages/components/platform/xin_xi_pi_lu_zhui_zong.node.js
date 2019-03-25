module.exports = ctx => {
  const {
    detail,
    detail: {
      letter_batch_test
    }
  } = ctx.state
  if (!detail) {
    throw new Error('业务错误，请调用平台详情接口')
  }
  return {
    // 底层资产追踪
    property_detail: letter_batch_test && letter_batch_test.property_detail || '',
    // 平台的前十大股东
    bg_shareholder: letter_batch_test && letter_batch_test.bg_shareholder || '',
    // 融资情况
    bg_financing: letter_batch_test && letter_batch_test.bg_financing || '',
    // 疑似实际控制人
    bg_control: letter_batch_test && letter_batch_test.bg_control || '',
  }
}