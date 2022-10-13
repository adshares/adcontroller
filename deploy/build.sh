#!/usr/bin/env bash

# Usage: build.sh [<work-dir>]
cd ${1:-"."} || exit 1

mkdir -p var/{panel-assets,panel-assets-history}

composer install --no-dev --no-interaction
if [ $? -ne 0 ]; then exit 1; fi

yarn install
if [ $? -ne 0 ]; then exit 1; fi

yarn build
if [ $? -ne 0 ]; then exit 1; fi
