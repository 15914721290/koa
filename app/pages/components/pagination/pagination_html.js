$('.pagination select').on('change', function (e) {
  var t = e.target
  var url = t.getAttribute('first').replace('1.html', t.selectedIndex + 1 + '.html')
  window.location.href = url
})
