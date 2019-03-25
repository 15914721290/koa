$('.m-head input').on('keypress', function(e) {
  if (e.keyCode == 13) {
    e.target.form.submit()
  }
})
