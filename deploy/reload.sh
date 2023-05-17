#!/usr/bin/env bash

cp -fr public/assets-default/* public/build
find var/panel-assets -maxdepth 1 -name "favicon*" -exec cp {} public/build \;
find var/panel-assets -maxdepth 1 -name "logo*" -exec cp {} public/build \;
find var/panel-assets -maxdepth 1 -name "*.css" -exec cp {} public/build/custom.css \;
