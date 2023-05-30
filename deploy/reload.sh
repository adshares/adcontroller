#!/usr/bin/env bash

APP_ASSETS=public/build/assets
APP_ASSETS_DEFAULT=public/assets-default
UPLOADED_ASSETS=var/panel-assets

rm -rf $APP_ASSETS
mkdir -p $APP_ASSETS
cp -fr $APP_ASSETS_DEFAULT/* $APP_ASSETS
find $UPLOADED_ASSETS -maxdepth 1 -name "favicon*" -exec cp {} $APP_ASSETS \;
find $UPLOADED_ASSETS -maxdepth 1 -name "logo*" -exec cp {} $APP_ASSETS \;
find $UPLOADED_ASSETS -maxdepth 1 -name "custom.*.css" -exec cp {} $APP_ASSETS/custom.css \;
