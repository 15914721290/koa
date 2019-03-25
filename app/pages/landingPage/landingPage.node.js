module.exports = async (ctx) => {
  ctx.status = 301
  ctx.redirect('https://android.myapp.com/myapp/detail.htm?apkName=com.p2pfellow')
  return
}