#/bin/sh

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

