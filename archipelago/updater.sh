#!/bin/bash

osascript -e 'tell application "Archipelago" to quit'

pgrep -x "Archipelago" | xargs kill

while pgrep -x "Archipelago" > /dev/null; do sleep 0.2; done

rm -rf "/Applications/Archipelago.app"
cp -R "$HOME/Library/Application Support/Archipelago/Archipelago.app" "/Applications/"

open "/Applications/Archipelago.app"
