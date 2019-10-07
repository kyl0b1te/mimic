#!/bin/sh

docker run -d --name mimic-debug \
  --rm --env-file .env \
  -v $PWD:/mimic \
  -w /mimic \
  -p 9229:9229 \
  -p 8080:8080 \
  node:11.10 \
  ./node_modules/.bin/nodemon --exec "node --inspect=0.0.0.0:9229 -r ./node_modules/ts-node/register src/index.ts" --watch src
