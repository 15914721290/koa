require('../components/pc_hot_search/pc_hot_search')

$('.period').on('change', function (e) {
  var parts = e.target.selectedOptions[0].value.split(',')
  var url = window.location.href + parts[0] + '-' + parts[1] + '-0-0-0-1.html'
  window.location.href = url
})

$('.score').on('change', function (e) {
  var value = e.target.selectedOptions[0].value
  var parts = $('.period')[0].options[1].value.split(',')
  var url = window.location.href + parts[0] + '-' + parts[1] + '-' + value + '-0-0-1.html'
  window.location.href = url
})

$('.rebate').on('change', function (e) {
  var value = e.target.selectedOptions[0].value
  var parts = $('.period')[0].options[1].value.split(',')
  var url = window.location.href + parts[0] + '-' + parts[1] + '-0-' + value + '-0-1.html'
  window.location.href = url
})

$('.context').on('change', function (e) {
  var value = e.target.selectedOptions[0].value
  var parts = $('.period')[0].options[1].value.split(',')
  var url = window.location.href + parts[0] + '-' + parts[1] + '-0-0-' + value + '-1.html'
  window.location.href = url
})
