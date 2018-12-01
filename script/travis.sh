#!/usr/bin/env bash

if [ "$YARN_COMMAND" == "dist-windows" ]; then
  docker run --rm \
    --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "apt-get update && apt-get -y install libx11-dev libxkbfile-dev && yarn --link-duplicates --pure-lockfile --ignore-engines && yarn run dist --win"
else
  yarn --link-duplicates --pure-lockfile --ignore-engines
  yarn $YARN_COMMAND
fi
