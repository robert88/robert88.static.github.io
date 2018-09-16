const HtmlWebPackPlugin = require("html-webpack-plugin");
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: "file-loader",
						options: { minimize: true }
					}
				]
			},
			// {
			// 	test: /\.css$/,
			// 	use: [MiniCssExtractPlugin.loader, "css-loader"]
			// },
			{
				test: /\.(png|jpg|gif)$/,
				loader: 'file-loader',
				query:{
					name:'img/[name]-[hash:5].[ext]'  //这里img是存放打包后图片文件夹，结合publicPath来看就是/webBlog/build/img文件夹中，后边接的是打包后图片的命名方式。
				}
			},
		]
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: "./src/index.html",
			filename: "./index.html"
		}),
		// new MiniCssExtractPlugin({
		// 	filename: "[name].css",
		// 	chunkFilename: "[id].css"
		// })
	]
};
