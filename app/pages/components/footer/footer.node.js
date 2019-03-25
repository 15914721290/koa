module.exports = ctx => {
  const origin = ctx.state.wwwOrigin
  return {
    about: `${origin}/about.html`,
    law: `${origin}/law.html`,
    contact: `${origin}/contact.html`,
    sitemap: `${origin}/sitemap.html`
  }
}