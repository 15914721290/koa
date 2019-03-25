#!/bin/bash
# 本文件是自动化发布测试环境和生产环境的，由Jenkins调用。

cd $(dirname $0)/..

isProduction="false"

while [ -n "$1" ]; do
  if [[ $1 = "-p" ]]; then
    isProduction=$2
    echo "isProduction:${isProduction}"
    shift
  else
    echo "unknown params $1"
    exit 3
  fi
  shift
done

npm i || (echo "npm install failed" && exit 1)
npm run build || (echo "build failed" && exit 2)

SHA1=`git rev-parse HEAD`

if [[ $isProduction = "true" ]]; then
  ssh root@39.108.189.254 "bash /home/ppgt/www/ppgt_seo/scripts/update.sh -p ${isProduction} -sha1 ${SHA1}"
else
  echo "update server now."
  ssh root@192.168.1.233 "bash /lvdata/www/ppgt_seo/scripts/update.sh -p ${isProduction} -sha1 ${SHA1}"
fi
