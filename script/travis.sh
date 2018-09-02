#!/usr/bin/env bash

if [ "$TRAVIS_OS_NAME" == "linux" ] && [ "$YARN_COMMAND" == "build" ]; then
  docker run --rm \
    --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "apt-get update && apt-get -y install libx11-dev libxkbfile-dev && yarn --link-duplicates --pure-lockfile --ignore-engines && yarn run dist --linux --win"
elif [ "$TRAVIS_OS_NAME" == "linux" ] && [ "$YARN_COMMAND" == "lint" ]; then
  yarn --link-duplicates --pure-lockfile --ignore-engines
  yarn lint
elif [ "$TRAVIS_OS_NAME" == "linux" ] && [ "$YARN_COMMAND" == "test" ]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
  yarn --link-duplicates --pure-lockfile --ignore-engines
  yarn test
else
  yarn dist
fi
