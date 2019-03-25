require('../components/pc_search_bar/pc_search_bar')

$('.pagination select').on('change', function (e) {
  var t = e.target
  var index = t.selectedIndex
  var first = t.getAttribute('first')
  if (index === 0) {
    window.location.href = first
  } else {
    var url = first.substring(0, first.lastIndexOf('=') + 1) + (t.selectedIndex + 1)
    window.location.href = url
  }
})
