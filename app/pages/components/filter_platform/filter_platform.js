$('.filter-score').on('mouseenter', function () {
  $('.score-list').show()
  $('.score-selected').addClass('active')
}).on('mouseleave', function () {
  $('.score-list').hide()
  $('.score-selected').removeClass('active')
})
$('.score-item').on('click', function () {
  var t = $(this)
  t.addClass('current').siblings().removeClass('current')
  $('.score-list').hide()
  $('.score-selected').attr('data-value', t.attr('data-value')).removeClass('active').html(t.html())
})

$('.filter-percent').on('mouseenter', function () {
  $('.percent-list').show()
  $('.percent-selected').addClass('active')
}).on('mouseleave', function () {
  $('.percent-list').hide()
  $('.percent-selected').removeClass('active')
})
$('.percent-item').on('click', function () {
  var t = $(this)
  t.addClass('current').siblings().removeClass('current')
  $('.percent-list').hide()
  $('.percent-selected').attr('data-value', t.attr('data-value')).removeClass('active').html(t.html())
})

$('.filter-go').on('click', function () {
  var array = [0,0,0,0,0,0,0,0,1]
  var score = $('.score-selected').attr('data-value')
  var rebate = $('.percent-selected').attr('data-value')
  array[0] = score
  array[1] = rebate
  var join = array.join('-')
  window.location.href = '/p2p/' + join + '.html'
})