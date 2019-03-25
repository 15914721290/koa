

function isOS() {
  return navigator.userAgent.match(/ipad|iphone/i)
}

function fallbackCopyTextToClipboard(text) {
  let textArea
  let range
  let selection
  textArea = document.getElementById('_copyinpu')
  textArea.value = text

  if (isOS()) {
    range = document.createRange()
    range.selectNodeContents(textArea)
    selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    textArea.setSelectionRange(0, 999999)
  } else {
    textArea.select()
  }

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    textArea.blur()
    console.log('Fallback: Copying text command was ' + msg)
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err)
  }
}

module.exports.copyTextToClipboard = function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  navigator.clipboard.writeText(text).then(function() {
    console.log('Async: Copying to clipboard was successful!')
  }, function(err) {
    console.error('Async: Could not copy text: ', err)
  })
}
