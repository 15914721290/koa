require('../components/categories/categories.in')
require('../components/pagination/pagination_no_html')

$('.baike-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.baike-tab').index(this)
  $('.baike-showcase').eq(index).addClass('active').siblings().removeClass('active')
})
