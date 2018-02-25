#!/bin/bash

set -x

useracct=$(whoami)
echo "Running stop as $useracct"

### check for pids for our applications; first forever, then the application itself
forever_pid=$(ps aux | grep [f]orever | tr -s " " | cut -d " " -f 2)
if [ ! -z "$forever_pid" ]
then
    echo "forever process running as pid:$forever_pid, terminating."
    kill $forever_pid
fi
node_pid=$(ps aux | grep [b]ot.js | tr -s " " | cut -d " " -f 2)
if [ ! -z "$node_pid" ]
then
    echo "bot.js process running as pid:$node_pid, terminating."
    kill $node_pid
fi