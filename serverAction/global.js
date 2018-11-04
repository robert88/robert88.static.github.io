exports=module.exports={
	//动态更新action
	"refreshAction":function(req,res,next){
		console.log("refresh action!".green);
		rap.actionMap = require("../rap.server.action.js").init();
		next(rap.actionMap,"text/text");
	},
	/**
	//动态更新config cache设置信息
	*/
	"refreshConfigCache":function(req,res,next){
		next("fail","text/text")
	},

	//重启服务
	"restartRapserver":function(req,res,next){
		process.exit(200)

	}
}
