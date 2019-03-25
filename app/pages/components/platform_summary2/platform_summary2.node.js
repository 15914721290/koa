
const { NewOperationState } = require('../../../foundation/constant.js')
const moment = require('moment')


function get_gongshang_url(ctx,baseUrl){
  return `${baseUrl}/beian/`
}

module.exports =  ctx => {
  const {detail,baseUrl} = ctx.state
  if (!detail || !baseUrl){
    throw new Error('业务错误，请调用平台详情接口 platform_summary2.node.js')
  }
  return {
    // 平台logo
    img: detail.platform_icon,
    // 平台名称
    name: detail.platform_name,
    // 运营状态
    state: NewOperationState[detail.pf_type] && NewOperationState[detail.pf_type][detail.pf_operation].name || '未知',
    state_css:NewOperationState[detail.pf_type] && NewOperationState[detail.pf_type][detail.pf_operation].css || 'stop',
    // 关注人数
    guan_zhu_ren_shu: detail.follow_num || '0',
    // 上线时间
    company_time:detail.company_time ? moment(detail.company_time*1000).format('YYYY.MM.DD') : '-',
    // 注册地
    province:detail.province || '-',
    // 工商信息url
    gongshang_url: get_gongshang_url(ctx,baseUrl),
  }
}