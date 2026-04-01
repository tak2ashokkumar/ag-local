#!/bin/bash

AG_HOME="/c/Users/AshokKumar/Desktop/ag-local"

agcdd(){
    cd "$AG_HOME"
}

aguldb(){
   cd "$AG_HOME/uldb"
}

agunity(){
    cd "$AG_HOME/uldb/ngx-unity"
}

agmtp(){
    cd "$AG_HOME/uldb/ngx-mtp"
}

agmockapi(){
    cd "$AG_HOME/tools/mock-api" || return
}

agproxy(){
    cd "$AG_HOME/tools/proxy" || return
}

agstartmock(){
    agmockapi || return
    npm start
}

agstartproxy(){
    agproxy || return
    node server.js
}

agbuildunity() {
    agunity || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

agserveunity() {
    agunity || return
    npm run static-server
}

agbuildmtp() {
    agmtp || return
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --watch
}

agservemtp() {
    agmtp || return
    npm run static-server
}

agbuildprod() {
    # move to respective folder either ngx-mtp or ngx-unity and run
    node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --configuration production
}