#!/bin/bash

useracct=$(whoami)
echo "Running start as $useracct"


export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd ~/node
forever start bot.js