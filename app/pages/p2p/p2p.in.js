require('../components/platform_tabs/platform_tabs')
require('../components/filter_platform/filter_platform')
require('../components/pc_search_bar/pc_search_bar')

new Swiper('.swiper-container', {
  autoplay: 3000,
  pagination: '.swiper-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})

$('.recom-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.recom-tab').index(this)
  $('.recom-showcase').eq(index).addClass('active').siblings().removeClass('active')
})
