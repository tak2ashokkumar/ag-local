#!/bin/bash

AG_HOME="/c/Users/AshokKumar/Desktop/ag-local"

cdd(){
    cd "$AG_HOME"
}

uldb(){
   cd "$AG_HOME/uldb"
}

unity(){
    cd "$AG_HOME/uldb/ngx-unity"
}

mtp(){
    cd "$AG_HOME/uldb/ngx-mtp"
}

mockapi(){
    cd "$AG_HOME/tools/mock-api" || return
}

proxy(){
    cd "$AG_HOME/tools/proxy" || return
}

startmock(){
    mockapi || return
    npm start
}

startproxy(){
    proxy || return
    node server.js
}

buildunity() {
    unity || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

serveunity() {
    unity || return
    npm run static-server
}

buildmtp() {
    mtp || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

servemtp() {
    mtp || return
    npm run static-server
}

buildprod() {
    # move to respective folder either ngx-mtp or ngx-unity and run
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --configuration production
}