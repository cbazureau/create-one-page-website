#!/bin/sh

rm -rf docs/
cd ./packages/create-one-page-website/
npm run demo
cd demo
npm run build
cp -a ./dist ../../../docs
cd ../../../