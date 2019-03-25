const { copyTextToClipboard } = require('./copy')

$('.p-btn a').on('click', function(e) {
  e.preventDefault()
  copyTextToClipboard($(this).attr('data-copy'))
})