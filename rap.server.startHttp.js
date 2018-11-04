/*
*
* @title：rap框架
* 用于构建通用的web程序
* @author：尹明
* */

require("./rap.config.js");

const wake = require("./serverLib/rap.filesystem.js");



/**
 * 清除response;防止内存泄漏
 * 报错的时候要清除掉
 * */
var responseCache = [];

function clearNullAndFinished(filter) {
    var newArr = [];
    for (var i = 0; i < responseCache.length; i++) {
        if (responseCache[i] && responseCache[i].finished == false) {
            if (typeof filter == "function" && filter(responseCache[i]) === false) {
                continue;
            }
            newArr.push(responseCache[i]);
        }
    }
    responseCache = newArr;
}

/**
 * Create HTTP server.
 */
const http = require("http");
const https = require("https");
const domain = require('domain');
var requestFilter = require("./rap.server.request.js");
var handleResponse = require("./rap.server.response.js");

/**
 * http和https处理
 * */

function handleAction(req, response){

        clearNullAndFinished();

    responseCache.push(response);

    var d = domain.create();

    d.run(function () {
        try {

            requestFilter(req, function (request) {

                handleResponse(request, response);

            });

        } catch (err) {
            handlerErr(err, response, "trycatch")
        }
    });

    //捕获大部分异常
    d.on('error', function (err) {
        handlerErr(err, response, "domainErrorEvent")
    });
}

http.createServer(handleAction).listen(rap.config.serverPort);
https.createServer(handleAction).listen(443);
/**
 * 处理错误
 * */
function handlerErr(err, response, name) {
    if (typeof err == "string") {
        err = {message: err, stack: err};
    }
    rap.error(name, ":", err.stack); // log the error

    if (err.stack && err.stack.indexOf("no such file or directory") != -1) {
        response.writeHead(404);
        response.end(err.message);
    } else {
        response.writeHead(err.status || 500);
        response.end(err.message);
    }
}

/**
 * 捕获部分异常
 * */
process.on('uncaughtException', function (err) {
    err.status = 505;
    clearNullAndFinished(function (response) {
        handlerErr(err, response, "uncaughtException");
        response = null;
        return false;
    });
});

if(rap.masterStatus!="restart"){
    /**
     * 启动默认浏览器
     * **/
    var childProcess = require('child_process');
    var path = require("path");

    childProcess.exec('reg query "HKEY_CLASSES_ROOT\\http\\shell\\open\\command"', function (err, stdout) {
        var defaultBrowser;
        if (err) {
            rap.error("cmd query reg defaultBrower:",err);
        } else if (defaultBrowser = stdout.match(/"[^"]+\.exe"/)) {
            //有空格的路径需要加上""
            defaultBrowser = defaultBrowser[0].replace(/^"|"$/g, "").replace(/\\([^\\]*)/g, function (m, m1) {
                if (~m.indexOf(" ")) {
                    return "\\\"" + m1 + "\""
                } else {
                    return m
                }
            });
            childProcess.exec('start ' + defaultBrowser + ' http://localhost:' + rap.config.serverPort + "/defaultWeb/index.html", function (err, stdout) {
                if (err) {
                    rap.error("cmd start defaultBrowser:",err);
                }
            });
        } else {
            rap.error("can not find default browser uri");
        }
    });
}
