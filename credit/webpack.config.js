const ConsoleLogOnBuildWebpackPlugin = require("./webpackCoustomPlugin_Test.js")
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
				},
				{
					test: /\.js$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					include: resolve('src')
				}
			]
		},
		plugins: [
			new ConsoleLogOnBuildWebpackPlugin()
		],
		resolve: {
			alias: {
				'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
			}
		}
	}
}
