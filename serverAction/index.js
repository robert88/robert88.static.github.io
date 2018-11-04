var wakePromise = require("../serverLib/rap.filesystem.promise");
var wake = require("../serverLib/rap.filesystem");
/*
* 同步中异步获取文件
* */
async function asyncFindFile(absolutePath,type)
{
	return wakePromise.findFile(absolutePath,type||"html",true)
}
async function asyncFindAllFile(req)
{
	var cacheFile = rap.config.cachePath+"/action_index_getAllHtml.js"
	if(await wakePromise.isExist(cacheFile )){
		return require( cacheFile );
	}else{

		var absolutePath = "";
		var path = {};
		for(var rootId in rap.config.staticPathMap){
			absolutePath = rap.config.staticPathMap[rootId];
			//如果有path表示获取单独路径的html
			if(req.params.path) {
				absolutePath =( absolutePath + "/" + req.params.path).toURI();
			}
			if (!wake.isExist(absolutePath)) {
				break;
			}
			if(absolutePath){
				var htmlArr =await asyncFindFile(absolutePath,"html");
				htmlArr.forEach(function (val,idx) {
					htmlArr[idx] = val.replace(absolutePath,"");
				});
				path[rootId]=htmlArr;
			}
		}
		await wakePromise.writeData(cacheFile ,"exports=module.exports="+JSON.stringify(path));
		return path;
	}


}
async function asyncFindAllFileByType(req,type)
{


		var absolutePath =  req.params.path;
		var type = req.params.fileType;
		var filterReg = req.params.filterReg;
		var replaceFun = req.params.replaceFun;
   		 // replaceFun must是replace函数
		replaceFun = new Function("file","return file."+replaceFun);
		if (!absolutePath||!wake.isExist(absolutePath)) {
			return false
		}

			var htmlArr =await asyncFindFile(absolutePath,type);

		if(filterReg){
            htmlArr = htmlArr.filter(function (file) {
                var reg = new RegExp(filterReg);
                return reg.test(file)
            });
		}


		for(var i=0;i<htmlArr.length;i++){
			var newFile = replaceFun(htmlArr[i]);
			var data = await wakePromise.readData(htmlArr[i] );
			await wakePromise.writeData(newFile ,data);
		}
	
		return true;
}
exports=module.exports={
	"addRootPath":function(req,res,next){
		var params = req.params;
		if(params.path&&params.rootId){
			rap.config.staticPathMap[params.rootId]=params.path;
            exports["clearHtmlCache"](req,res,next,rap.config.staticPathMap);
		}else{
			next("fail","text/text")
		}
		
	},
	/**
	删除index/getAllHtml产出的cache
	*/
	"clearHtmlCache":function(req,res,next,successData){
		var cacheFile = rap.config.cachePath+"/action_index_getAllHtml.js";
		wakePromise.deleteFile(cacheFile).then(function(){
            successData = successData||{code:200,msg:"sucess"}
			next(successData)
		}).catch(function(){
			next("fail","text/text")
		});
	},
	"delRootPath":function(req,res,next){
		var params = req.params;
		if(params.path&&params.rootId){
			delete rap.config.staticPathMap[params.rootId];
            this["clearHtmlCache"](req,res,next,rap.config.staticPathMap);
		}else{
			next("fail","text/text")
		}

	},
	"getRootPath":function(req,res,next){
		next(rap.config.staticPathMap);
		
	},
	"getAllHtml":function (req,res,next) {

		asyncFindAllFile(req).then(function (map) {
			next(map);
		})
    },
	"modifyFileName":function (req,res,next) {

		asyncFindAllFileByType(req).then(function (flag) {
			if(flag){
                next("success","text/text");
			}else{
                next("fail","text/text");
			}

		})
	},
	"/":function (req,res,next) {
		var params = req.params;
		var staticPathMap = rap.config.staticPathMap;
		var ret ="index.html"
		var rootMap = {
			"rapserver":"/defaultWeb/index.html",
			"lockpc":"index.html"
		}
		if(params.responseRootId){
			ret= rootMap[params.responseRootId];
		}else{
			for(var pathType in staticPathMap){
				if(rootMap[pathType]){
					ret = rootMap[pathType];
					break;
				}
			}
		}
		next(ret);
	}
}
