#!/usr/bin/env bash

mkdir -p public/panel-assets
cp -fr public/panel-assets-default/* public/panel-assets
find var/panel-assets -name "favicon-*" -exec cp {} public/panel-assets \;
