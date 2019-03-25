const fetch = require('node-fetch')
const config = require('./config')
const md5 = require('js-md5')

const kExpireMs = 1000 * 60 * 5
let kDataCache = {}
const kRequests = {}

/**
 * 本文件特殊编码规范：
 * 为了方便编码，所有api接口都按照特征来命名，用下划线连接。
 * 注意！！！缓存是直接返回的，没有clone，所以外部不能对数据做修改，只读。
 */
class Backend {

  // cache的结构：
  // {
  //   [md5(api+content)]: {
  //     data: dataFromBackend,
  //     time: timeOfDataCreation,
  //   },
  //   ...
  // }
  // 逻辑：
  // 对api和content做md5运算，得到key。先按照key获取value，如果有，再判断过时，如果过时，先返回过时数据，再发真实请求。
  // 如果没有，立即请求。请求回来后，如果是成功的，直接放入cache，并记录放入cache的当前时间。
  commonFetch(ctx, api, content = {}, cachable = true) {
    const conbine = api + JSON.stringify(content)
    const key = md5.hex(conbine)
    const apiClean = ctx && ctx.state.apiClean
    if (apiClean && (apiClean === 'all' || apiClean[api]) ) {
      return this.fetchFromBackend(key, api, content, true, cachable)
    }

    if (cachable) {
      const value = kDataCache[key]
      if (value) {
        const time = value.time
        const now = new Date().getTime()
        if (now - time > kExpireMs) {
          this.fetchFromBackendIfNotFetching(key, api, content, true)
        }
        return Promise.resolve(value.data)
      }
    }

    return this.fetchFromBackendIfNotFetching(key, api, content, cachable)
  }

  fetchFromBackendIfNotFetching(key, api, content, cachable) {
    kRequests[key] = kRequests[key] || []
    const pendings = kRequests[key]
    const request = new Promise((resolve, reject) => {
      // ！！！这里这么写，而不用async await的原因是为了解决多用户，同时请求的并发问题！！！
      pendings.push({
        resolve,
        reject
      })
    })
    if (pendings.length === 1) {
      this.fetchFromBackend(key, api, content, false, cachable)
        .then(json => {
          let requests = kRequests[key]
          while (requests.length > 0) {
            const first = requests.shift()
            first.resolve(json)
          }
        }).catch(err => {
          let requests = kRequests[key]
          while (requests.length > 0) {
            const first = requests.shift()
            first.reject(err)
          }
        })
    }
    return request
  }

  localDebugApi(url,headers,body,begin,api,contentString,cachable,key) {
    // : axios proxy 调式接口参数使用
    return require('axios')(url, {
      method: 'POST',
      headers,
      proxy: {
        host: '127.0.0.1',
        port: 8888,
      },
      data: body
    }).then(res => {
      const end = new Date().getTime()
      const ms = end - begin
      if (config.verboseLog) {
        console.log('backend: ' + api + ' | ' + contentString + ' use ' + ms + ' ms')
      }
      if (ms > 250) {
        console.log('backend overtime! ' + api + ' | ' + contentString + ' use ' + ms + ' ms')
      }
      return res.data
    }).then(json => {
      if (json.code === 0) {
        if (cachable) {
          kDataCache[key] = {
            data: json.content,
            time: new Date().getTime()
          }
        }
        return json.content
      } else {
        console.log('api code error: ' + api + ' | ' + contentString  + ' | ' + json.msg)
        return Promise.reject(json.msg)
      }
    })
  }

  fetchFromBackend(key, api, content, clean, cachable) {
    const contentString = JSON.stringify(content)
    if (config.verboseLog) {
      console.log('backend: ' + api + ' | ' + contentString)
    }
    const url = config.serverAddress + api
    const body = 'p=' + encodeURI(contentString)
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'platform': 'seo',
      'key': md5.hex(`ppgt/${api}seo${config.version}request`).toUpperCase(),
      version: config.version,
      source: '',
      userid: ''
    }
    if (clean) {
      headers.Apicache = 'no-cache'
    }
    const begin = new Date().getTime()
    // 调试接口api参数使用
    // return this.localDebugApi(url,headers,body,begin,api,contentString,cachable,key)
    return fetch(url, {
      method: 'POST',
      headers,
      body
    }).then(res => {
      const end = new Date().getTime()
      const ms = end - begin
      if (config.verboseLog) {
        console.log('backend: ' + api + ' | ' + contentString + ' use ' + ms + ' ms')
      }
      if (ms > 250) {
        console.log('backend overtime! ' + api + ' | ' + contentString + ' use ' + ms + ' ms')
      }
      return res.json()
    }).then(json => {
      if (json.code === 0) {
        if (cachable) {
          kDataCache[key] = {
            data: json.content,
            time: new Date().getTime()
          }
        }
        return json.content
      } else {
        console.log('api code error: ' + api + ' | ' + contentString  + ' | ' + json.msg)
        return Promise.reject(json.msg)
      }
    })
  }

  clearCache() {
    kDataCache = {}
  }

  gtcustomscene_info(ctx, obj) {
    return this.commonFetch(ctx, 'gtcustomscene?c=info', obj)
  }
  gtcustomscene_blockinfo(ctx, obj) {
    return this.commonFetch(ctx, 'gtcustomscene?c=blockinfo', obj)
  }
  seoplatform_getPlatformCount(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=getPlatformCount', obj)
  }
  seoplatform_platformMap(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=platformMap', obj)
  }
  seoplatform_getColumnList(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=getColumnList', obj)
  }
  seoplatform_list(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=list', obj)
  }
  seoplatform_getPlatformLetter(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=getPlatformLetter', obj)
  }
  seoplatform_platformRank(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=platformRank', obj)
  }
  seoplatform_detail(ctx, obj) {
    // http://183.6.116.151:6091/api_ma/index.php?c=admininter&a=info&id=84
    return this.commonFetch(ctx, 'seoplatform?c=detail', obj)
  }
  seoplatform_recommendPlatform(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=recommendPlatform', obj)
  }
  gtspecial_getSpecialAllList(ctx, obj) {
    return this.commonFetch(ctx, 'gtspecial?c=getSpecialAllList', obj)
  }
  gtspecial_list(ctx, obj) {
    return this.commonFetch(ctx, 'gtspecial?c=list', obj)
  }
  gtspecial_info(ctx, obj) {
    return this.commonFetch(ctx, 'gtspecial?c=info', obj)
  }
  gtwiki_getwikialllist(ctx, obj) {
    return this.commonFetch(ctx, 'gtwiki?c=getwikialllist', obj)
  }
  gtwiki_list(ctx, obj) {
    return this.commonFetch(ctx, 'gtwiki?c=list', obj)
  }
  gtwiki_wikiinfo(ctx, obj) {
    return this.commonFetch(ctx, 'gtwiki?c=wikiinfo', obj)
  }
  gtnews_list(ctx, obj) {
    // http://183.6.116.151:6091/api_ma/index.php?c=admininter&a=info&id=87
    return this.commonFetch(ctx, 'gtnews?c=list', obj)
  }
  gtnews_getnewsalllist(ctx, obj) {
    return this.commonFetch(ctx, 'gtnews?c=getnewsalllist', obj)
  }
  gtnews_newsorder(ctx, obj) {
    return this.commonFetch(ctx, 'gtnews?c=newsorder', obj)
  }
  gtnews_topline(ctx, obj) {
    return this.commonFetch(ctx, 'gtnews?c=topline', obj)
  }
  gtnews_newsinfo(ctx, obj) {
    return this.commonFetch(ctx, 'gtnews?c=newsinfo', obj)
  }
  gtnews_newsRelated(ctx, obj) {
    return this.commonFetch(ctx, 'gtnews?c=newsRelated', obj)
  }
  search_searchWiki(ctx, obj) {
    return this.commonFetch(ctx, 'search?c=searchWiki', obj)
  }
  search_searchNews(ctx, obj) {
    return this.commonFetch(ctx, 'search?c=searchNews', obj)
  }
  search_platform(ctx, obj) {
    return this.commonFetch(ctx, 'search?c=platform', obj)
  }
  gtcolumn_urlMap(ctx, obj) {
    return this.commonFetch(ctx, 'gtcolumn?c=urlMap', obj)
  }
  seoplatform_getLinks(ctx, obj) {
    return this.commonFetch(ctx, 'seoplatform?c=getLinks', obj)
  }
  tag_tagPageList(ctx, obj) {
    return this.commonFetch(ctx, 'tag?c=tagPageList', obj)
  }
  tag_tagRecommend(ctx, obj) {
    return this.commonFetch(ctx, 'tag?c=tagRecommend', obj)
  }
  post_topicContent(ctx, obj) {
    return this.commonFetch(ctx, 'post?c=topicContent', obj)
  }
  post_maxlike(ctx, obj) {
    return this.commonFetch(ctx, 'post?c=maxlike', obj)
  }
  comment_listPlatform(ctx, obj) {
    // http://183.6.116.151:6091/api_ma/index.php?c=admininter&a=info&id=91
    return this.commonFetch(ctx, 'comment?c=listPlatform', obj)
  }

  // 组合请求接口
  composerapi_download(ctx, obj) {
    return this.commonFetch(ctx, 'composerapi?c=download', obj)
  }

  // 自定义组合接口
  scoreRanks(ctx, scores) {
    const now = new Date()
    const year = now.getFullYear()
    let month = now.getMonth() + 1
    if (month < 10)
      month = '0' + month
    const action = scores.map(value => ({
      api: 'seoplatform?c=platformRank',
      param: {
        date: `${year}${month}`,
        score: value,
        page_index: 0,
        page_size: 10
      },
      map: value
    }))
    return backend.composerapi_download(ctx, {
      action
    })
  }

  rank3Type(ctx, orders) {
    const action = orders.map(order => ({
      api: 'seoplatform?c=list',
      param: {
        page_index: 0,
        page_size: 10,
        order
      },
      map: order
    }))
    return backend.composerapi_download(ctx, {
      action
    })
  }
}

const backend = new Backend()
module.exports = backend