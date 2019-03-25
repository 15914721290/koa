$('.bottom-tab').on('mouseover', function () {
  $(this).addClass('active').siblings().removeClass('active')
  var index = $('.bottom-tab').index(this)
  $('.bottom-showcase').eq(index).addClass('active').siblings().removeClass('active')
})