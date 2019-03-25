require('../components/pc_hot_search/pc_hot_search')

new Swiper('.swiper-container', {
  autoplay: 3000,
  pagination: '.swiper-pagination',
  observer: true,
  observeParents: true,
  loop: true,
  paginationClickable: true
})
