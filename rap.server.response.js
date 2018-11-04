var wake = require("./serverLib/rap.filesystem.js");//同步

var mine = require("./serverLib/rap.server.response.types.js");

var zlib = require("zlib");

var fs = require("fs");

var path = require("path");

var qs = require('querystring');

var zlibMap = {
	"gzip": zlib.createGzip,
	"gunzip": zlib.createGunzip,
	"deflate": zlib.createInflate
};
var zipType = zlibMap["gzip"];

var staticPathMap = rap.config.staticPathMap;

/**
 * 写流文件
 * */
function createWriteStream(file, outpath, zip) {
	return new Promise(function (resolve) {

		var out, inp;

		if (typeof outpath == "object") {
			out = outpath;
			inp = fs.createReadStream(file);
		} else {
			out = fs.createWriteStream(outpath, {encoding: 'utf-8', bufferSize: 11});
			inp = fs.createReadStream(file, {encoding: 'utf-8', bufferSize: 11});
		}
		if (zip) {
			inp.pipe(zip).pipe(out);
		} else {
			inp.pipe(out);
		}

		inp.on("end", function () {
			resolve();
		});
	});
}
/**
 * 处理response
 * */
function responseData(ret, request, response, type) {

	var spacialText = type == "text/text";

	type = type || "text/html";

	//只要有cookie就使用text/plain
	if (request.cookie.length) {
		type = "text/plain";
	} else if (spacialText) {
		type = "text/html";
	}

	var headerOption = {
		"X-Powered-By": "robert-rap-server",
		"Content-Type": type,
		"Set-Cookie": request.cookie
		//"Access-Control-Allow-Headers": "x-requested-with"
	};

	var zip = zipType();

	if (spacialText) {
		rap.log("请求结果为text/text");
		response.writeHead(200, headerOption);
		response.end(ret.toString());
	} else if (rap.type(ret) !== "string" || ret == "") {
		headerOption["Content-Type"]="application/json";
		rap.log("请求结果application/json");
		response.writeHead(200, headerOption);
		response.end(JSON.stringify(ret));
	} else {
		//找到对应的包文件
		var absolutePath = "";
        var absolutePathTemp;
		if(request.params.responseRootId){

             absolutePathTemp = (staticPathMap[request.params.responseRootId] + "/" + ret).toURI();
			//地址是ip地址
			if(staticPathMap[request.params.responseRootId].indexOf("\\\\")==0){
				absolutePathTemp = absolutePathTemp.replace(/^\\|^\//,"\\\\");
			}
            if (wake.isExist(absolutePathTemp)) {
                absolutePath = absolutePathTemp;
            }
        }else{
            for(var pathType in staticPathMap){
                absolutePathTemp = (staticPathMap[pathType] + "/" + ret).toURI();
                //地址是ip地址
				if(staticPathMap[pathType].indexOf("\\\\")==0){
					absolutePathTemp = absolutePathTemp.replace(/^\\|^\//,"\\\\");
				}
                if (wake.isExist(absolutePathTemp)) {
                    absolutePath = absolutePathTemp;
                    break;
                }
            }

        }

		if (!absolutePath) {
			throw Error("no such file or directory:" + ret);
		}

		rap.log("请求结果为静态文件：", absolutePath);

		var acceptEncoding = request.headers["accept-encoding"] || "";

		//如果是jpg,不需要压缩，jpg已经压缩
		if (acceptEncoding.match(new RegExp("gzip")) && path.extname(absolutePath) != ".jpg") {

			headerOption["Content-Encoding"] = "gzip";
			response.writeHead(200, headerOption);
			createWriteStream(absolutePath, response, zip)

		} else {
			response.writeHead(200, headerOption);
			createWriteStream(absolutePath, response)
		}
	}
}
/**
 * url中参数中proxy必须为true
 * *proxyHost为域名
 * proxyProtocol协议默认为http
 * */
var https = require("https");
var http = require('http');
function proxy(url, request, response) {

	var body = '';
	var protocol = http;
	var opt = {
		port: '80',
		host: request.params.proxyHost,
		method: request.method,//这里是发送的方法
		path: url,
		headers: request.headers,
		ip: request.params.proxyIP || ""
	}

	//得到一个真实的参数
	if (request.method == "GET" && request.params && !rap.isEmptyObject(request.params)) {
		var paramsStr = []
		for (var i in request.params) {
			if (i != "proxy" && i != "proxyHost" && i != "proxyIP" && i != "proxyProtocol") {
				paramsStr.push(i + "=" + encodeURIComponent(request.params[i]));
			}
		}
		opt.path = opt.path + "?" + paramsStr.join("&");
	}


	if (request.params.proxyProtocol == "https") {
		protocol = https;
		opt.port = 443
	}
    opt.headers.host = opt.host;
    opt.headers.referer = request.params.proxyProtocol+"://"+opt.host;

	var req = protocol.request(opt, function (res) {
		//如果是图片不需要过滤掉cookie的话就直接使用这个方法
		if (res.headers["set-cookie"]) {
			res.headers["set-cookie"].forEach(function (val, idx) {
				//cookie跨域
				if (request.params.proxyCookiesDomain) {
					val = val.replace("domain=" + request.params.proxyCookiesDomain + ";", "")
				}
				res.headers["set-cookie"][idx] = val;
			});
		}

		response.writeHead(res.statusCode, res.headers);

		//如果是图片就直接使用通道流
		if (res.headers["content-type"] && ~res.headers["content-type"].indexOf("image")) {
			res.pipe(response);
			return
		}
		var buffer = [];
		res.on('data', function (d) {
            buffer.push(d);
		}).on('end', function () {
			response.end(buffer.join(""));
		});

	}).on('error', function (e) {
		response.end(e);
	});
	//如何是post请求就直接将params做为请求体
	if (request.method == "POST") {
		req.write(qs.stringify(request.params));
	}
	req.end();
}

/**
 * 做一些响应处理函数
 */
exports = module.exports = function (request, response) {

	var ret;

	var url = request.url;

	var actionMap = rap.actionMap

	//匹配代理爬虫功能
	if (request.params.proxy) {

		proxy(url,request, response);

		//匹配action为function
	} else if (typeof actionMap[url.toLowerCase()] == "function") {

		//请求超时处理
		var timer = setTimeout(function () {
			throw new Error("response timeout");
		}, rap.config.timeout||60000);//默认1分钟

		actionMap[url.toLowerCase()](request, response, function (ret, type) {
			clearTimeout(timer);
			responseData(ret, request, response, type);
		});

	} else {

		//actionMap匹配字符串或者是空
		ret = (actionMap[url.toLowerCase()] || url).toString();

		var extname = path.extname(path.basename(ret)).replace(".", "").replace(/\?.*/, "");

		//静态文件
		if (extname && mine[extname]) {
			responseData(ret, request, response, mine[extname]);
			//单纯的字符串
		} else {
			//将文件转为html，是ajax异步请求

			if (request.isXMLHttpRequest) {
				responseData("404", request, response, "text/text");
			}else{
				ret = ret+".html";
			}
			responseData(ret, request, response, "text/html");
		}

	}

}
