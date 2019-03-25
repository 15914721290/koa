$('.platform-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.platform-tab').index(this)
  $('.platform-showcase').eq(index).addClass('active').siblings().removeClass('active')
})
