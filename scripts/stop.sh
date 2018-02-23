#/bin/sh

forever_pid=$(ps aux | grep [f]orever | tr -s " " | cut -d " " -f 2)
kill $forever_pid
node_pid=$(ps aux | grep [n]ode | tr -s " " | cut -d " " -f 2)
kill $node_pid