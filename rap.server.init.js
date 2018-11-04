
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

global.rap  = global.rap || {};

if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);

    cluster.fork().send('start');

    cluster.on('exit', (worker, code, signal) => {
        if(code==200){
             console.log(`worker ${worker.process.pid} died`);
             cluster.fork().send('restart');
        }
    });


} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server

    //接收master的消息

    process.on('message', (msg) => {
        console.log("master msg",msg,`${process.pid} `);

        rap.masterStatus = msg;
        require("./rap.server.startHttp.js");
    });


    console.log(`Worker ${process.pid} started`);
}
