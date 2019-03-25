const util = require('../foundation/util')
const converter = require('../foundation/DataConverter')


function get_gzh_block (block_content, platform, isDefault, des) {
  const content_intro = util.o(()=>(block_content.content_intro.match(/[^\r?\n?]+/g)))
  const content_icon = util.o(()=>block_content.content_icon)
  const shouldFalse = !platform
    || !block_content
    || !content_intro
    || content_intro.length < 6
    || !content_icon
    || !content_intro[0]
    || !content_intro[1]
    || !content_intro[2]
    || !content_intro[3]
    || ( des==='m' && !content_intro[4] && content_intro[4].indexOf('[button]')!==0)
    || ( des==='m' && !content_intro[5] && content_intro[5].indexOf('[copy]')!==0)
  if (shouldFalse) {
    return {
      isOk: false,
      des
    }
  } else {
    const re = {
      words: isDefault ? content_intro.slice(0,4) : content_intro.slice(0,4).map(o=>o.replace(/\[platform_name\]/g, platform.platform_name)),
      btnText: util.o(()=>content_intro.find(o=>o.startsWith('[button]')).replace('[button]', '')) || '',
      copyText: util.o(()=> content_intro.find(o=>o.startsWith('[copy]')).replace('[copy]', '')) || '',
      imgSrc: content_icon,
      isOk: true,
      des
    }
    return re
  }
}

module.exports.get_gzh = function (ctx, block) {
  const platform = util.o(() => ctx.state.newsInfo.news_label.platform)
  if(!platform || !platform.pf_type){
    return []
  }
  const mapingAd_gzh = util.getAd_mark('is_platform_type', platform.pf_type)
  try {
    const re = mapingAd_gzh.map(oo=>{
      const block_content = util.o(()=>block[oo.gKey.split('-')[0]].block_child_list[oo.gKey].block_content[0])
      const c_block_content = block_content && get_gzh_block(block_content, platform, oo.isDefault, oo.des)
      return {
        ...oo,
        ...c_block_content
      }
    })
    return re
  } catch (error) {
    console.log('​}catch -> error', error)
  }
}

module.exports.get_platform_ad = function (ctx, block) {
  const platform = util.o(() => ctx.state.detail)
  const mapingAd = util.getAd_mark('is_platform_detail', platform.pf_type)
  mapingAd.gzh_block = mapingAd.detail.map(o=>{
    const block_content = util.o(()=>block[o.gKey.split('-')[0]].block_child_list[o.gKey].block_content)
    if (!block_content || !block_content[0]) {
      return {
        isOk: false
      }
    }
    const c_block_content = converter.convertAdBlock(ctx, block_content)
    const tem = {
      ...o,
      content_name: util.o(() =>block_content[0].content_name),
      content_remark: util.o(() =>block_content[0].content_remark),
      ...c_block_content[0]
    }
    tem.isOk = Boolean(tem.content_name && tem.content_remark && tem.img)
    return tem
  })
  return mapingAd.gzh_block
}

module.exports.get_gtfl = function (ctx, block) {
  const gtfl_info = util.getAd_mark('is_gtfl')
  gtfl_info.items = gtfl_info.items.map(o=>{
    const block_content = util.o(()=>block[gtfl_info.pKey].block_child_list[o].block_content)
    if (!block_content || block_content.length === 0) {
      return {
        isOk: false
      }
    }
    const cblock_content = converter.convertAdBlock(ctx, block_content)
    return {
      adId: o,
      isOk: Boolean(block_content[0].content_name && cblock_content[0]),
      title: block_content[0].content_name,
      content_remark: block_content[0].content_remark,
      ...cblock_content[0]
    }
  })
  gtfl_info.isOk = gtfl_info.items.some(o=>o.isOk)
  return gtfl_info
}