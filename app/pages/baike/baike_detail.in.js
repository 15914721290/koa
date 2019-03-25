$('.news-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.news-tab').index(this)
  $('.news-showcase').eq(index).addClass('active').siblings().removeClass('active')
})