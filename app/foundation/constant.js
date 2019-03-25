// 平台转台值
module.exports.OperationState = ['未知', '正常运营', '停业 / 转型', '问题平台']

module.exports.showNumber = 3

const StateCss = ['normal','unusual','blacklist','stop']

module.exports.NewOperationState = {
  '可投平台':{
    '正常运营':{
      name:'正常运营',
      css:StateCss[0]
    }
  },
  '观望平台':{
    '无争议': {
      name:'正常运营',
      css:StateCss[0]
    },
    '经侦介入': {
      name:'经侦介入',
      css:StateCss[1]
    },
    '立案侦查':{
      name:'立案侦查',
      css:StateCss[1]
    },
    '提现困难':{
      name:'提现困难',
      css:StateCss[1]
    },
    '疑似跑路':{
      name:'疑似跑路',
      css:StateCss[1]
    },
    '负面舆论集中':{
      name:'负面舆论集中',
      css:StateCss[1]
    },
  },
  '黑名单':{
    '平台失联':{
      name:'平台失联',
      css:StateCss[2]
    },
    '平台清盘':{
      name:'平台清盘',
      css:StateCss[2]
    },
    '良性退出':{
      name:'良性退出',
      css:StateCss[2]
    },
    '暂停运营':{
      name:'暂停运营',
      css:StateCss[2]
    },
    '平台诈骗':{
      name:'平台诈骗',
      css:StateCss[2]
    },
    '跑路':{
      name:'跑路',
      css:StateCss[2]
    },
  },
  '停止运营':{
    '停止运营':{
      name:'停止运营',
      css:StateCss[3]
    }
  }
}

module.exports.Enme_comment_pf_pop = {
  1:{
    displayName:'好评',
    css:'good'
  },
  2:{
    displayName:'一般',
    css:'normal'
  },
  3:{
    displayName:'差评',
    css:'bad'
  }
}

module.exports.Post_Type = {
  'QUESTION' : 1, //问题
  'ANSER' : 2, //回答
  'ARTICLE' : 3, //文章
  'DISCUSS':4, //讨论(帖子)
  'SPECIAL':15, //专题
  'PLARFORM_REVIEW':20, //平台有了新的测评
  'PLATFORM_CHANGE_STATE':21, //平台状态的变更
  'HTTP_Link':888, // http跳转
}

module.exports.ERR_PLATFORM='ERR_PLATFORM'

module.exports.LANDINGPAGE = {
  'WebPlatformDetail': 'WebPlatformDetail'
}