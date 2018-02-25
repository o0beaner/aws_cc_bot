#/bin/bash

set -x

### check for pids for our applications; first forever, then the application itself

forever_pid=$(ps aux | grep [f]orever | tr -s " " | cut -d " " -f 2)

echo "Forever pid: $forever_pid"
if [ ! -z "$forever_pid" ]
then
    kill $forever_pid
fi
node_pid=$(ps aux | grep [n]ode | tr -s " " | cut -d " " -f 2)
echo "Node pid: $node_pid"
if [ ! -z "$node_pid" ]
then
    kill $node_pid
fi

### check for node, install if necessary

node_bin=$(which node)
echo "Node bin: $node_bin"
echo $node_bin
if [ -z $node_bin ]
then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm_bin=$(which nvm)
    echo "Nvm bin: $nvm_bin"
    if [ -z $nvm_bin ]
    then
        yum install -y curl
        curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    nvm install 9.5.0
fi

forever_bin=$(which forever)
if [ -z $forever_bin ]
then
    npm install forever -g
fi