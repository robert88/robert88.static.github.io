/*
*
* @title：rap框架
* @author：尹明
*
* */
//__dirname：全局变量，存储的是文件所在的文件目录
//__filename：全局变量，存储的是文件名
var rootPath = __dirname.replace(/\\/g,"/");

global.rap  = global.rap || {};
var wake = require("./serverLib/rap.filesystem.js");

global.rap = {
	config : {
		rootPath:rootPath,//当前rap.init.server.js所在的路径
		staticPathMap:{},//当前根路径后面覆盖前面文件
		sqlConnection:"postgres://postgres:'ym@20150904'@localhost/postgres",//sql链接串
        sqlFile:rootPath+"/dao/sql",//sql脚本
        logPath:"",//log路径
        sqlDebug:true,
		timeout:30000,//处理action30s超时
        actionPath:rootPath +"/serverAction",//导入接口文件路径ou
		startPath:"",//启动地址
        serverPort:3000, //服务启动端口
        cachePath:rootPath+"/configCache"
	}
}

if(wake.isExist(rap.config.cachePath+"/rootPathMap.js")){
	rap.config.staticPathMap =require(rap.config.cachePath+"/rootPathMap.js");
}else{
	rap.config.staticPathMap["rapserver"] = rootPath+"/WEB-INFO";
}

console.log("启动程序所在路径:",rootPath);
console.log("action文件路径为：", rap.config.actionPath);
console.log("服务器根路径：",rap.config.staticPathArr);

/**通用全局工具
 * 扩展String.prototype的属性
 * */
require("./serverLib/rap.util.color.js");
require('./serverLib/rap.util.prototype.js');
require("./serverLib/rap.process.cmd.js");
require('./serverLib/rap.util.tool.js');
require('./serverLib/rap.util.module.js');
require("./serverLib/rap.util.timeout.js");
require("./serverLib/rap.server.log.js");
require("./rap.promission.js");
require("./rap.server.action.js");
