#!/usr/bin/env bash

# Usage: build.sh [<work-dir>]
cd ${1:-"."}

ASSET_DIRECTORIES=("var/panel-assets" "var/panel-assets-tmp")
for ASSET_DIRECTORY in "${ASSET_DIRECTORIES[@]}"
do
  if [ ! -d "${ASSET_DIRECTORY}" ]
  then
    echo "Creating ${ASSET_DIRECTORY} directory"
    mkdir -p "${ASSET_DIRECTORY}"
  fi
done

composer install --no-dev --no-interaction
if [ $? -ne 0 ]; then exit 1; fi

yarn install
if [ $? -ne 0 ]; then exit 1; fi

yarn build
if [ $? -ne 0 ]; then exit 1; fi
