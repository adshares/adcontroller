#!/usr/bin/env bash

rm -rf public/build/assets
mkdir -p public/build/assets
cp -fr public/assets-default/* public/build/assets
find var/panel-assets -maxdepth 1 -name "favicon*" -exec cp {} public/build/assets \;
find var/panel-assets -maxdepth 1 -name "logo*" -exec cp {} public/build/assets \;
find var/panel-assets -maxdepth 1 -name "*.css" -exec cp {} public/build/assets/custom.css \;
