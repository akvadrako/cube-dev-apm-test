#!/bin/bash -ex

gh cs ports -c $CODESPACE_NAME visibility 3000:public 4000:public 5000:public 4001:public 4002:public 4003:public

docker-compose up -d
