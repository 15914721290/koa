require('../components/categories/categories.in')

new Swiper('#main-swiper', {
  autoplay: 3000,
  pagination: '#main-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})

function initSubSwiper (i) {
  $('.category-tab-' + i).on('mouseover', function () {
    $(this).addClass('active').siblings().removeClass('active')
    var index = $('.category-tab-' + i).index(this)
    $('.category-item-' + i).eq(index).addClass('active').siblings().removeClass('active')
  })
}

for (var i = 0; i < 6; ++i) {
  new Swiper('#swiper' + i, {
    autoplay: 3000,
    pagination: '#pagination' + i,
    observer: true,
    observeParents: true,
    loop: true,
    paginationClickable: true
  })

  initSubSwiper(i)
}