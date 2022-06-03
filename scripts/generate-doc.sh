#!/bin/sh

rm -rf docs/
cd ./packages/create-one-page-website/
npm run demo
cd demo
npm run build
cp -a ./dist ../../../docs
cd ../../../
echo "include: [/up_/.cow-temp/]" > ./docs/_config.yml
