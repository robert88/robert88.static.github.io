
var url = require('url');
var qs =require("querystring");
//使request具备http服务

var requestCount = 0;
exports = module.exports = function (req,callback) {
	
	requestCount++;

	//统一初始化
	var obj = {
		url:function(set){
			return set.originURL.replace(/\?.*$/,"").replace(/#.*$/,"")
		},
		hash:function(set){
			if(~set.originURL.indexOf("#")){
                return "";
			}else{
                return set.originURL.replace(/^.*#/,"");
			}
		},
		search:function(set){
			var url = set.originURL.replace(/#.*$/,"");
			if(~url.indexOf("?")){
                return set.originURL.replace(/#.*$/,"").replace(/^[^?]*\?/,"")
			}else{
                return ""
			}
		},
		method:function (set) {
			return set.method.toUpperCase();
		},
		isXMLHttpRequest:function(set){
			var xReq = set.headers['x-requested-with']
			return (xReq&& (xReq.toLowerCase()=="XMLHttpRequest".toLowerCase()) )
		}
	};

	req.originURL = req.url;

	for(var i in obj){
		if(typeof  obj[i]=="function"){
			req[i] = obj[i](req);
		}
	}
	
	//兼容中文路径
	req.url = decodeURIComponent(req.url.trim());
	
	//存放cookie
	req.cookie = [];

	if (req.method== 'POST') {

		//可能数据很大时候，需要用代理
		var postBuffer = [];
		/**
		 * 因为post方式的数据不太一样可能很庞大复杂，
		 * 所以要添加监听来获取传递的数据
		 * 也可写作 req.on("data",function(data){});
		 */
		req.addListener("data", function (data) {
			// if(postBuffer.length>100){
            //
			// }else{
            //
			// }
			postBuffer.push(data);
		});
		/**
		 * 这个是如果数据读取完毕就会执行的监听方法
		 */
		req.addListener("end", function () {

            req.params = qs.parse(postBuffer.join(""));

            paramsTypeConvert(req.params);

			if(postBuffer.length>20){
                rap.log("累计请求:",requestCount.toString().red," 请求类型:"+ req.method,"请求url:"+req.url,"大参数（可能是文件）");
			}else{
                rap.log("累计请求:",requestCount.toString().red," 请求类型:"+ req.method,"请求url:"+req.url,"请求参数：",req.params);
			}

            postBuffer = null;
			
			callback(req);
		});
	}
	else if (req.method == 'GET') {

		/**
		 * 也可使用var query=qs.parse(url.parse(req.url).query);
		 * 区别就是url.parse的arguments[1]为true：
		 * ...也能达到‘querystring库’的解析效果，而且不使用querystring
		 */
		req.params = url.parse(req.originURL, true).query;

		paramsTypeConvert(req.params);
		
		rap.log("累计请求:",requestCount.toString().red," 请求类型:"+ req.method,"请求url:"+req.url,"请求参数：",req.params);
			
		callback(req);
	} else {
		
		rap.log("累计请求:",requestCount.toString().red," 请求类型:",req.method);
		
		callback(req);
	}
};
/**
 * 参数类型转换
 * */
function paramsTypeConvert(params){
	//bool值的
	for(var k in params){
		if(params[k]==="true"){
			params[k]=true;
		}else if(params[k]==="false"){
			params[k]=false;
		}
	}
}

