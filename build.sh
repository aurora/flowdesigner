#!/usr/bin/env bash

dir=$(cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)
dst=$dir/build/flowdesigner.build.js

if [ ! -d $dir/build ]; then
    mkdir $dir/build
fi

>$dst

for i in flowdesigner.js src/connector.js src/wire.js src/node.js src/diagram.js; do
    cat $i >> $dst
done
