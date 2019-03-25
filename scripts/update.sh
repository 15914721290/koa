#!/bin/bash
# 本脚本运行在正式环境服务器

cd $(dirname $0)/..

isProduction="false"
SHA1=""

while [ -n "$1" ]; do
  if [[ $1 = "-p" ]]; then
    isProduction=$2
    echo "isProduction:${isProduction}"
    shift
  elif [[ $1 = "-sha1" ]]; then
    SHA1=$2
    echo "sha1 is ${SHA1}"
    shift
  else
    echo "unknown params $1"
    exit 3
  fi
  shift
done

if [ -z "$SHA1" ]; then
  echo "must assign the SHA1"
  exit 3
fi

rollback=`git rev-parse HEAD`

echo "git fetch"
git fetch || (echo "fetch error" && exit 4)
echo "git parse"
git rev-parse $SHA1 || (echo "rev-parse error" && exit 5)

git checkout -f $SHA1 || git checkout -f $rollback
git clean -dfx app
npm i
npm run build
npm run delete
if [[ $isProduction == "true" ]]; then
  npm run pm2-prod
else
  npm run pm2
fi

echo "success update server"
