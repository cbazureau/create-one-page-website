#!/bin/sh

rm -rf demo/
node index.js demo --template file:../cow-template --scripts-version file:../cow-scripts
cd demo/ 
npm i $(npm pack ../../cow-scripts);