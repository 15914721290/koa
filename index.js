process.env.NODE_ENV = process.env.NODE_ENV.trim() // 本地环境的添加local环境变量后面会带有空格
const app = require('./app/app')

// :port 端口 8123 http://127.0.0.1:8123
app.listen(8123)