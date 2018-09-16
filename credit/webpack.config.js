const ConsoleLogOnBuildWebpackPlugin = require("./coustomEventPlugin.js");
var path =require("path");
function resolve(file) {
	return path.resolve(__dirname,file);
}
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebPackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

exports = module.exports = function () {
	return {
		mode: "development",
		devtool: "source-map",
		// loader: {test: /\.vue$/, loader: "vue-loader"},
		// entry:resolve("./src/index.js"),
		module: {
			rules: [
				{
					test: /\.vue$/,
					loader: 'vue-loader'
				},
				{
					test: /\.(png|jpg|gif)$/,
					loader: 'file-loader',
					// query:{
					// 	name:'img/[name]-[hash:5].[ext]'  //这里img是存放打包后图片文件夹，结合publicPath来看就是/webBlog/build/img文件夹中，后边接的是打包后图片的命名方式。
					// }
					options:{
						useRelativePath:true,
						publicPath:resolve("./src")
					}
				},

				{
					test: /\.html$/,
					loader: 'file-loader',
					// query:{
					// 	name:'[name].[ext]'  //这里img是存放打包后图片文件夹，结合publicPath来看就是/webBlog/build/img文件夹中，后边接的是打包后图片的命名方式。
					// },
					// options:{
					// 	name:'[folder]t.[ext]',
					// 	outputPath:"go",
					// 	context:__dirname,
					// 	publicPath:"set",
					// 	useRelativePath:true,
					// 	// emitFile:false
					//
					// }
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
	    	new VueLoaderPlugin(),
	new HtmlWebPackPlugin({
		// template: resolve("./src/index.html"),
		// filename: 'index.html',
		// chuck:["index.js"]
	})
		],
		resolve: {
			alias: {
				'@': resolve('src'),
				'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
			}
		}
	}
}
