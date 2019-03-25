// 生产环境用的
module.exports = {
  apps: [{
    name: 'hjgt',
    script: 'index.js',
    env: {
      COMMON_VARIABLE: 'true',
      NODE_ENV: 'production'
    },
    output: './logs/ouput.log',
    error: './logs/error.log',
    out_file: './logs/app-out.log',
    pid_file: './logs/pid',
    log_date_format: 'MM-DD HH:mm:ss',
    exec_mode: 'cluster',
    merge_logs: true,
    instances: 'max',
    watch: false
  }]
}
