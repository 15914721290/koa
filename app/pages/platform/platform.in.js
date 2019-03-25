require('../components/pc_hot_search/pc_hot_search')
require( '../components/platform_popup/platform_popup')
require('../components/platform/zhu_jia_shen_du_ce_ping')
require('../components/platform/navigation/index')

// :js njk template
$.ajax({
  type: 'POST',
  url: '{{ serverAddress }}logs?c=clickRecord',
  data: 'p={"url":"' + window.location.href + '"}',
  beforeSend: function (req) {
    req.setRequestHeader('platform', 'seo'),
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  },
  success: function (data) {
    console.log(data)
  }
})