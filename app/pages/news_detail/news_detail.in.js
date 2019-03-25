require('../components/categories/categories.in')
require('../components/ad/gzh')

$('.baike-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.baike-tab').index(this)
  $('.baike-showcase').eq(index).addClass('active').siblings().removeClass('active')
})

$('.news-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.news-tab').index(this)
  $('.news-showcase').eq(index).addClass('active').siblings().removeClass('active')
})

new Swiper('.swiper-container', {
  autoplay: 3000,
  pagination: '.swiper-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})