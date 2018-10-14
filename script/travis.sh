#!/usr/bin/env bash

yarn --link-duplicates --pure-lockfile --ignore-engines

if [ "$YARN_COMMAND" == "lint" ]; then
  yarn lint
elif [ "$YARN_COMMAND" == "test" ]; then
  export DISPLAY=:99.0
  sh -e /etc/init.d/xvfb start
  sleep 3
  yarn test
else
  yarn dist
fi
