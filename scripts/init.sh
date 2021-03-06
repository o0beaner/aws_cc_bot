#!/bin/bash

### check for nvm installation
if [ ! -d ~/.nvm ]
then
    echo "nvm not found, initializing installation..."
    curl_bin=$(which curl)
    if [ -z $curl_bin ]
    then
        echo "installing curl..."
        sudo yum install -y curl
    fi
    echo "curl found, installing nvm..."
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
else
    echo "nvm seems to be installed"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

node_bin=$(which node)
forever_bin=$(which forever)

### check for node installation
if [ -z $node_bin ]
then
    echo "node not found, installing..."
    nvm install 9.5.0
fi

### check for forever installation
if [ -z $forever_bin ]
then
    echo "forever not found, installing..."
    npm install forever -g
fi