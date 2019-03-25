# 概述

互金跟投 SEO 仓库。对外网站 [https://www.51hjgt.com/](https://www.51hjgt.com/)

## 技术栈与选型

- [koa2](https://koajs.com/)家族：router、compress、bodyparser、koa-nunjucks-2、koa-static
- [nunjucks](https://mozilla.github.io/nunjucks/api.html)：模板引擎
- less
- [webpack](https://webpack.js.org/) v4：预处理 js 和 css
- babel：浏览器端 js 的 es6 转换。服务器端没做转换，以nodejs原生支持为准
- node-fetch：服务器端网络框架
- jQuery：浏览器端的交互
- jquery.lazyload：使用图片懒加载。（未实现）
- [pm2](http://pm2.keymetrics.io/)：服务器部署管理
- eslint：代码规范
- [swiper 2](https://2.swiper.com.cn/)：轮播。为兼容 IE9，只能用 v2。

## 日常开发

node 端口在所有环境都是 8123，测试环境的nginx 会在 3008 端口做代理，生产环境是https的443。

- `npm start`：本地开发用，带有 watch。改了任何的文件后，在浏览器刷新即可。
- `npm run clean`：清理 webpack 生成的中间文件
- start以后，在vscode里直接按F5就能调试

这些命令是服务器用的：

- `npm run build`：构建生产环境的 webpack 资源
- `npm run pm2-production`：启动 pm2 管理。多进程模式。详情参考`pm2.config.js`
- `npm run pm2`：启动 pm2 管理。多进程模式。详情参考`pm2.config.js`
- `npm run reload`：服务器使用。更新代码后，刷新 pm2 服务
- `npm run delete`: 停止并删除掉pm2的任务

本地开发，可以使用 [dns-server](https://github.com/hursing/dns-server)来映射二级域名问题（dns-server映射Host IP域名，Nginx解决二级域名的路由）

## 需求分析（为什么这样设计）

- 要做前后端分离，后端 php 提供接口。node 端不操作数据库，仅通过 php 的 api 获取数据来渲染。
- SEO 要求 html 的核心区域都是服务器端渲染，给爬虫直接分析。为此引入`nunjucks`作为模板引擎。选择 nunjucks 是因为外包做的第 1 版使用了它，没其它特别理由，可被 ejs、xtemplate 等替换。
- 路由匹配使用`koa2`，利用 es7 语法`async await`简化代码。因为上层还有 nginx，不需要 node 直接对外，所以没使用[eggjs](https://eggjs.org/)。nginx还负责解析至别的二级域名
- 要做响应式设计。按照业界标准，以 540px 为界限区分 pc 和移动版。
- 部分页面有用户交互，浏览器端执行的 js 使用 jQuery 框架
- 为了方便写代码，使用 less 作为 css 处理器。
- 模板渲染不会压缩处理 js、css 等，所以需要`webpack`来预处理 js 和 css、less。
- 兼容 IE9，放弃 IE8。只因追求技术
- seo 要求 html 内的 html 型链接（a 标签）url 都需要绝对路径，其它类型的资源可以是相对路径
- 一套代码在pc和m使用，故不能针对m版使用flex、rem，等比缩放必须使用百分比。
- chrome不再支持把字体大小设置到小于12px，所以想用 10的倍数来使用em单位 行不通了，那就全部都使用px为单位
- css 尽量只在页内复用，不跨页面复用。如果可复用的地方没超过3个，使用复制粘贴会更利于维护。跨页复用也许会在开发时减少代码量，但在维护时修改一处代码会考虑不到影响面有多广。特别是换个人来开发时，对业务不熟悉的情况很容易改出问题。
- 所有非静态源的图片，都添加出错时的默认图片，即添加`onerror`属性
- zepto只支持IE10+，我们要支持9+，所以只能用jQuery

## webpack 配置说明

步骤：

1. 扫描 views 下的文件，过滤出目标后缀名的文件，作为 entry 传给 webpack
2. webpack 会在 static 目录生成结果
3. 自定义了一个插件，它的作用是：
   - 把由 less 生成的 css 放回`views`目录
   - 把由`*.in.js`生成的js放会`views`目录并命令为`*.in.wp.js`
   - 把由`*.js`生成的js放到`public/js`目录

## 设计说明

### 小于 500ms 的平均响应时间

- 通用的 js、css 使用免费的 CDN 资源，尽量使用百度的资源库。
- node 运行的 js 不使用 babel，仅使用 node8 支持的语法，加速冷启动。
- backend cache，后置验证。请参看`backend.js`
- 全局通用的 js 可以使用外链，只有本网页使用的，除非可以`async`，否则利用模板内联到 html 上。
- css 全部内联到 html 上。webpack 会把 less 生成 css
- 网络层框架使用[node-fetch](https://github.com/bitinn/node-fetch)，为了和浏览器端的习惯一致，所以不选择`request-promise`或其它。

### 响应式

- m版：320-540px
- pc版，540-1000-1200px，1000 是兼容 1024 的，差 24 留给滚动条
- pad版未做设计，应该做的。

### nginx

nginx负责域名映射和静态资源托管。二级域名会被映射到`/internal/platform/`路径。

### router

关于如何写所有的`router.method('route', controller)`，有 3 种设计：

1. 每个模块各自导出一个 router，这个 router 已注册好所有路由，再在 app 中把所有 router 都 use。这样做好处是很容易知道这个 controller 对应什么路由。
2. 每个模板各自导出 method、route 和 controller，再写一个扫描函数，自动把以上信息应用到 1 个 router 上。这样做好处是节省了第 1 种的在 app use 的步骤。
3. 每个模块各自导出 controller，由一个 router 统一注册每个 route 和 controller。这样做好处是很快能找到对应的路由再延伸找到对应的 controller。

从开发角度想，第 1 第 2 种更便于开发，但第 3 种更便于维护。因为通常找代码都是按照 url 路径来找，在一个文件能看到所有的路由，再延伸去找到 controller 是最爽的。所以选择第 3 种设计，参考`router.js`。

### webpack

- 核心框架完全从 0 开始搭建，没有使用任何脚手架。
- node 可以监控在 node 运行的 js 变动，nunjucks 能监控 njk 文件的变动。但两者都监控不了在浏览器运行的 js 和 css 的变动，因为不是用 webpack-dev-server 运行的，只能手动刷新。
- nunjucks 不能把 views 目录外的文件 include 进来，所以 webpack 要把生成的文件放回 views 目录
- **新加 js 和 less 得重新`npm start`**，因为 webpack 不会发现新文件

### 目录结构

- docs：所有的文档
- index.js：node 的入口文件，只做一件事：启动 http 服务。
- config：所有配置文件
  - pm2.config.js：pm2 的测试服务器配置。具体的参数意义请参考[官方文档](https://pm2.io/doc/en/runtime/overview/)。
  - pm2.config.prod.js：pm2的生产环境服务器配置
  - webpack.config.xxx.js：webpack 的配置
- app
  - app.js：app 的设置
  - router.js：路由配置文件
  - public：存放所有静态资源，会被server托管
    - js：外链的 js 存放目录。webpack 会把结果 copy 到此，已配置`.gitignore`
    - css：外链的css
    - image：所有用到的图片
  - pages: 所有的页面，包括 controller、渲染模板、css、js
    - components：可复用的组件
  - foundation：基础设施目录
    - backend：后端交互模块，含 cache
    - config：app 的配置，常量
    - ApiCache：清理api缓存的中间件，参考后端的协议文档
    - DataConverter.js：转换后端数据，方便渲染
- static：webpack 结果文件存放目录，已被加入`.gitignore`
- scripts：由 Jenkins 执行，部署代码到服务器的 shell 脚本
- logs：pm2 运行的日志存放目录
- .eslintrc：eslint 的配置
- .vscode：vs code 的配置

### views 目录文件规范

每个页面、模块使用独立文件夹，文件夹命名跟其路由一致。文件夹内：

- xxx.njk：模板文件
- xxx.in.js：内联的js
- xxx.node.js：在node使用的js
- xxx.js：外链的js。注意，没`in`和`node`这一级了
- xxx.less：less

同时，这两个文件会由webpack生成，并设置了git ignored：

- xxx.in.wp.js：对`xxx.in.js`做了处理，会被`xxx.njk`内联
- xxx.css：由`xxx.less`生成，会被`xxx.njk`内联

js 内联和外链：

- 内联 js 以`.in.js`为后缀，会被`webpack`进行 babel 处理，在原地得到以`.in.wp.js`为后缀的文件，`.in.wp.js`需要被 nunjucks 模板 include 进去。
- 外链 js 直接以`.js`为后缀，会被`webpack`进行 babel 处理，并copy到`public/js`目录，需要在 nunjucks 模板里使用`<script>`标签引用。

- 用户交互相关且代码量大的 js 应该做外链，并标记 [defer](http://www.w3school.com.cn/html5/att_script_defer.asp)
- 代码量少的js可内联
- 在页面加载时就会操作 DOM 树的应该内联，例如swiper

### api缓存清理的设计

前端在2.0改成多进程。那么原来的清除api缓存设计将失去意义了，因为一次请求只会到达一个进程，其余进程并未清除缓存。多进程版本可以有两个实现方式：

1. 网络有单独的进程，其余进程只做渲染，都通过网络进程再去请求php。这样会失去性能了
2. 每个进程都另外做一个监听，某个进程收到清缓存的query后，发出广播，其余进程也清缓存。详情请查看`ApiCache.js`

## 编辑器

使用 vscode，编码规范都用 eslint 设置好了。需要安装 vscode 插件：ESLint、nunjucks

## 部署架构

- nginx 是最外层，监听 80 和 443 端口，代理到 nodejs 的 8123。负责二级域名的映射和 301 跳转。
- nodejs 监听 8123 端口
- 环境差异请查看`config.js`

## 自动化部署

- 地址：[jenkins](http://192.168.1.20:8080/job/51hjgt/build?delay=0sec)
- 账号：frontend
- 密码：12345678

## 手动部署

测试服务器：

- 地址：192.168.1.233
- ssh 账号：root
- 密码：bcb@123456
- 目录：cd /lvdata/www/ppgt_seo

具体流程和自动化部署脚本一致，请查看`update.sh`

## 文档

项目概貌请查看seo.xmind

### 项目文档

- [confluence](http://183.6.116.151:8090/pages/viewpage.action?pageId=495731)

### 产品 UI：svn 原型和设计稿

- [地址](http://192.168.1.246:84/!/#%E9%A1%B9%E7%9B%AE%E6%96%87%E6%A1%A3/view/head/%E4%BA%92%E9%87%91%E8%B7%9F%E6%8A%95SEO)
- 新来的同学需要找`黎桂明`开账号

### 测试环境管理系统地址

- [后台](http://192.168.1.231:6292/index.php?c=admin&a=login)
- 账号：admin
- 密码：gTu@@ww##wa123
- admin 账号无效了，新来的同学需要跟php负责人`陈邦伟`开账号

## 迭代历史

1.0 版本是由外包团队做的，做得很烂。2.0 由自己团队重写。

即使是 2.0，仍然是产品和 UI 经验不足，所以在产品和 UI 设计上都相对较差。故宁愿使用响应式设计，只做一套代码给 pc 和 m 用，降低维护成本。待时机成熟，还是应该大改版，pc 一套，m 一套。作为资讯站，pc 和 m 的体验差异应该很大。

### 解决的 1.0 的 bug

1. api 缓存没处理并发的情况，过期的瞬间会多个连接一起请求 php
2. 移动版是 vue 做的，自己获取 pc 版的数据填充到 m 版的 html 里，这样造成 js 文件很大，页面渲染慢
3. 处理完浏览器请求后还继续发数据（二级域名问题处理得不好）
4. pm2 没有开多进程，只有一个nodejs进程响应所有用户请求
5. api 接口没有错误处理，接口错误会显示 404 页面
6. 前端 ui 一堆的 bug，不少于 50 个
7. 高级筛选没有 m 版
8. 搜索没有默认结果页
9. pc 版网页在 pad 上非常不友好
10. 以不允许缓存的方式解决 304 问题
11. 部分页面有冗余的 js 外链
12. 一半响应式，一半自适应，乱七八糟
13. js 以同步方式加载运行
14. css 不是内联的
15. css 没有使用 less，维护困难
16. 代码规范乱，不统一
17. 不是所有的 a 标签 url 都是绝对地址
18. x-x-x... 之类的 url，若参数非法，没显示 404
19. /x-a/ 这样的 url 没有 404
20. 部分区域的数据出错，显示错误文案，而不是整个页面 404

## 其它

seo 对标网站：http://www.100bt.com/

## 约定

1. 按业务板块来准备数据
2. 本质是要导量，不是要做成网贷之家这么大型的东西。
3. 带分页的 url，有 link 标签 canonical
4. php 的接口中，content_url 的 type 是指定前端如何拼接 url 的，888 表示已经是完整地址。
5. **api缓存是直接返回缓存数据，未经过clone，所以不能直接对返回数据进行修改，只能做读操作**
6. 外链的js，需要在njk里加上`?version={{ appVersion }}`，解决版本更新问题清理浏览器缓存的问题

## TODO

- 非首屏的图片，懒加载。jquery.lazyload
- pad版的响应式适配。
- graceful shutdown。热升级
- 如果要兼容IE8，主要是不能使用`nth-child`这个css3特性，其它问题都好解决。css要改成外链，因为`respond.js`只能对外链css生效
- search页面，各子页分开less
- 1.x使用的express开启了etag，引起了304问题。koa没有etag，短期刷新连304都不会有了也是问题。
- 清理api缓存，vscode没做检验，因为现在它没意义
- `DataConverter.prepareUrlMap`是提前加载的，没有清理缓存机制
- title的应该是line-height单位为px + 负数margin-top来实现第二行间距
- api缓存，冷启动。使所有接口都是后置验证。
- 小图使用base64
- swiper有百度的cdn吗？现在是css内联、js在自己服务器了
