const ConsoleLogOnBuildWebpackPlugin = require("./webpackCoustomPlugin_Test.js")
var path =require("path");
function resolve(file) {
	console.log(path.resolve(__dirname,file))
	return path.resolve(__dirname,file);
}
const VueLoaderPlugin = require('vue-loader/lib/plugin')
exports = module.exports = function () {
	return {
		mode: "development",
		devtool: "source-map",
		// loader: {test: /\.vue$/, loader: "vue-loader"},
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader'
				}
				// {
				// 	test: /\.js$/,
				// 	loader: 'babel-loader',
				// 	exclude: /node_modules/,
				// 	include: resolve('./src')
				// }
			]
		},
		plugins: [
			new ConsoleLogOnBuildWebpackPlugin(),
	    new VueLoaderPlugin()
		],
		resolve: {
			alias: {
				'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
			}
		}
	}
}
