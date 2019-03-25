let isPositiveInteger = /^\d+$/

module.exports = {
  isNonNegativeInteger: function (num) {
    return isPositiveInteger.test(num) && !(num.startsWith('0') && num.length > 1)
  }
}
