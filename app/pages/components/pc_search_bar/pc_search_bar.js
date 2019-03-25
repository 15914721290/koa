$('.search-type-list').on('mouseenter', function () {
  $('.search-list').show()
  $('.search-type').addClass('active')
}).on('mouseleave', function () {
  $('.search-list').hide()
  $('.search-type').removeClass('active')
})

$('.search-item').on('click', function () {
  $('.search-list').hide()
  var t = $(this)
  $('.search-now').attr('data-value', t.attr('data-value'))
  $('.search-type').removeClass('active').html(t.html())
})

$('.search-now').on('click', function () {
  var type = $(this).attr('data-value')
  var key = encodeURI($('.search-key').val())
  // Note: js拿www域名是依赖nunjucks的，如果本文件没被include，那下面这行就错了
  window.location.href = '{{ wwwOrigin }}/search/?key=' + key + '&type=' + type
})

$('.search-key').on('keypress', function (e) {
  if (e.keyCode == 13) {
    $('.search-now').click()
  }
})
