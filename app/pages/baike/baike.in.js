require('../components/pc_search_bar/pc_search_bar')

new Swiper('#main-swiper', {
  autoplay: 3000,
  pagination: '#main-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})

for (var i = 0; i < 6; ++i) {
  new Swiper('#swiper' + i, {
    autoplay: 3000,
    pagination: '#pagination' + i,
    observer: true,
    observeParents: true,
    loop: true,
    paginationClickable: true
  })
}
