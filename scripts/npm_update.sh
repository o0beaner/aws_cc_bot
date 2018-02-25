#!/bin/bash

set -x

useracct=$(whoami)
echo "Running npm_update as $useracct"

cd ~/node
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

npm install