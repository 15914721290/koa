require('../components/categories/categories.in')
require('../components/pagination/pagination_no_html')

new Swiper('.swiper-container', {
  autoplay: 3000,
  pagination: '.swiper-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})

$('.baike-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.baike-tab').index(this)
  $('.baike-showcase').eq(index).addClass('active').siblings().removeClass('active')
})
