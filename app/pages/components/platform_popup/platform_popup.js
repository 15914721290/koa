$('#gen-qrcode-canvas').qrcode('{{ landingPageQr }}')
var canvasDataImg = $('#gen-qrcode-canvas canvas')[0].toDataURL()
$('#pop-qrcode-gen').attr('src', canvasDataImg)


$('.popup-img').on('click', function (e) {
  e.preventDefault()
  e.stopPropagation()
  $('.platform-popup').show()
  // $(document).one('click', function(){
  //   $('.platform-popup').hide()
  // })
  $('.platform-popup .close').one('click', function () {
    $('.platform-popup').hide()
  })
})


$('.platform-popup').on('click', function (e) {
  e.stopPropagation()
})
