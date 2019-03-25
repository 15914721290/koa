require('../components/pc_hot_search/pc_hot_search')
require('../components/platform_tabs/platform_tabs')
require('../components/filter_platform/filter_platform')

new Swiper('.swiper-container', {
  autoplay: 3000,
  pagination: '.swiper-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})

$('.news-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.news-tab').index(this)
  $('.news-showcase').eq(index).addClass('active').siblings().removeClass('active')
})
