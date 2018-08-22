const ConsoleLogOnBuildWebpackPlugin = require("./webpackCoustomPlugin_Test.js")
exports=module.exports=function(){
	return {
		mode:"development",
		devtool:"source-map",
		plugins:[
			new ConsoleLogOnBuildWebpackPlugin()

		],
		  resolve: {
		    alias: {
		      'vue$': 'vue/src/core/index.js' // 'vue/dist/vue.common.js' for webpack 1
		    }
		 }
	}
}
