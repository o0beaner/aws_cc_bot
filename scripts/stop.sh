#/bin/sh

### check for pids for our applications; first forever, then the application itself

forever_pid=$(ps aux | grep [f]orever | tr -s " " | cut -d " " -f 2)
if [ ! -z "$forever_pid" ]
then
    kill $forever_pid
fi
node_pid=$(ps aux | grep [n]ode | tr -s " " | cut -d " " -f 2)
if [ ! -z "$node_pid" ]
then
    kill $node_pid
fi

### check for node, install if necessary

node_bin=$(which node)
if [ -z $node_bin ]
then
    nvm_bin=$(which nvm)
    if [ -z $nvm_bin ]
    then
        yum install -y curl
        curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi

    nvm install 9.5.0
fi
