# 以下个核心概念
* entry
* output
* plugins
* mode
* optimization
* devtool
* resolve
* module.rules.loader
* target
* externals  
【查考链接】  
* https://webpack.js.org/configuration/configuration-languages/
* https://www.cnblogs.com/wangyingblog/p/7027540.html
* https://segmentfault.com/a/1190000010955254
* https://segmentfault.com/a/1190000012113011
* https://blog.csdn.net/joyce_lcy/article/details/78627268

##### entry

	来指定一个入口起点（或多个入口起点）。默认值为 "./src"；webpack就会找到src目录下的index.js打包到output里面   
	建议使用绝对路径
	
	```javascript
	entry:{
		lib:resolve("./src/vue.js")
		index:resolve("./src/vue.js")
	}
	```

##### output

	"./dist" 默认值 entry的文件对打包到 dist/main.js  
	
##### module 

定义rules和loader  

```javascript
module:{
	rules:[
		{
			test: /\.css$/,
			loader: "style!css!less",
			exclude: "/node_modules/",
			enforce: 'pre',
			include: [resolve('src')],
			options:{
				hotReload: false, // 热更新
				cssModules: {localIdentName: '[path][name]---[local]---[hash:base64:5]',camelCase: true},
				 limit: 10000,
				 name: 'static/img/[name].[hash:7].[ext]',
				 formatter: require('eslint-friendly-formatter'),
			 emitWarning: !config.dev.showEslintErrorsInOverlay
			}
			query:{
			name:'img/[name]-[hash:5].[ext]'  //不能和options同時用
		    }
		},
		{ test: /\.css$/, loaders: ["style","css","less"] }
		{ test: /\.html$/, loaders: "file-loader" },
		{ test: /\.js$/, loaders: "babel-loader" },
		{ test: /\.vue$/, loaders: "vue-loader"},
		{ test: /\.js$/, loaders: "babel-loader" },
		{ test: /\.css$/, loaders: [ 'vue-style-loader','css-loader']}
		{ test: /\.s?css$/, loaders: [ MiniCssExtractPlugin.loader,'css-loader','sass-loader']}
		{ test: /\.txt$/, loaders: 'raw-loader'}
		{ test: /.(png|jpe?g|gif|svg)(\?.*)?$/, loaders: 'url-loader'}
		{ test:  /\.(js|vue)$/, loaders: 'eslint-loader'}
		{test: /\.html$/,use: 'file-loader?limit=1024&name=[path][name].[ext]&outputPath=img/&publicPath=output/'}
	]
}
```
1、url-loader：1.1.1 

	会将引入的文件以base64编码，根據參數limit值來生成dataURl；
	只有文件超過limit值時，會調用file-loader，如果没有设置limit或者小於limit的文件全部转为base64方式
	1个参数：limit、+6個file-loader的參數
	两种方式字符串方式：
	```javascript
	//1、
	use: 'url-loader?limit=1024&name=[path][name].[ext]&outputPath=img/&publicPath=output/',
	//2、
	{ test: /\.(js|vue)$/, loader: 'eslint-loader', options: {}}
	```
2、file-loader:2.0.0;

	可以通過query得到options;也可以定義opitons
	6個參數：name、outputPath、publicPath、useRelativePath,context,emitFile。
	context:指定根地址，默認是webpack.config.js的路徑
	name可以是function也可以是string；通過loader-utils的interpolateName得到對應的規則[emoji] [hash] [ext] [name] [path] [folder];path是目錄帶/；folder表示文件夾（api/test/a.html這個路徑folder==test;path=="api/test/";name==a;ext==html）
	outputPath可以是function也可以是string；得到outputPath + name
	publicPath可以是function也可以是string；默認__webpack_public_path__ + outputPath；諾以"/"結尾就會得到publicPath+name方式;這值是針對Module export
	useRelativePath：是flag；會得到和context的當前file的相對地址RelativePath最終改變 outputPath = outputPath + RelativePath + name
	emitFile:false就導致loader不會生效

3、vue-loader15.4.1  
vue-loader，你需要告诉webpack如何使用babel-loader或者buble-loader处理.js文件，在webpack中配置babel-loader或者buble-loader  
这里打包css以sass 为例，用到了mini-css-extract-plugin插件提取css，用url-loader来处理字体、图片、音频等资源。非常简单  
是一个webpack的loader；可以将vue文件转换为JS模块；只处理.vue文件;依赖css-loader、vue-template-compiler所以要同时安装这两个
功能点：1、ES2015默认支持 ；2、可以和其他loader组合使用
配合css-loader vue-style-loader
```javascript
 {
	test: /\.css$/,
	oneOf: [
	  // this applies to <style module>
	  {
	    resourceQuery: /module/,
	    use: [
	      'vue-style-loader',
	      {
		loader: 'css-loader',
		options: {
		  modules: true,
		  localIdentName: '[local]_[hash:base64:8]'
		}
	      }
	    ]
	  },
	  // this applies to <style> or <style scoped>
	  {
	    use: [
	      'vue-style-loader',
	      'css-loader'
	    ]
	  }
	]
},
```
```javascript
//如果需要提取vue文件style到一个单独的文件的话就需要这样配置
//const MiniCssExtractPlugin = require("mini-css-extract-plugin");

//plugin
new MiniCssExtractPlugin({
	filename: "[name].css",
	chunkFilename: "[id].css"
})
//rule
{
	test: /\.css$/,
	use: [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
			  publicPath: '../'
			}	
		},
		"css-loader"
	]
},
```



3、postcss-loader  
4、eslint-loader 来配置eslint的检查，建立.eslintrc.js去设置规则
babel-load必须然后必须安装babel-loader babel-core
https://www.npmjs.com/package/babel-loader
如果index.js没有引用vue文件，打包的时候不会报错，如果引用了但是没有安装vue-loader就会提示Can't resolve 'vue-loader'
如果webpack里面没有配置vue-loader那么就会Module parse failed: Unexpected token
vue-html-loader  css-loader  vue-style-loader vue-hot-reload-api@1.3.2
css-loader、url-loader、html-loader
添加mini-css-extract-plugin，把css文件从bundle.js中独立成单独的css文件
file-loader是为了解决：希望在页面引入图片（包括img的src和background的url），根据我们的配置，将图片拷贝到相应的路径，再根据我们的配置，修改打包后文件引用路径，使之指向正确的文件
html-loader 这个包是为了解决html中img标签src引用的img这样通过解析html就可以调用img图片了
html-webpack-plugin
vue-html-loader





1、在js中import图片然后赋值给图片的src属性
import logo from '../img/logo.png';
document.getElementById('box').src = logo;
2、css中设置元素背景图片
.box{background-image: url(../img/logo.png)}
然后在js中通过import ‘@/css/index.css’的形式引入
3、在html的img标签中直接写入src属性，且一般是相对路径
<img src="img/logo.png" />
对于3中不能打包；可能是webpack已经升级了，需要用到html-withimg-loader'额外提供html的include子页面功能。


webapck4.0+以上版本不再推荐使用extract-text-webpack-plugin处理css模块，而使推荐mini-css-extract-plugin
實測we得到結論
1、webpack默認不能解析html、直接將html作爲入口會報錯；(You may need an appropriate loader to handle this file type.)
2、對於拷貝解析html的loader有；file-loader和html-webpack-plugin;
3、plugin和loader的區別；对于loader，它就是一个转换器；对于plugin，它就是一个扩展器，


##### plugins webpack插件

	###### 内置plugins 

	```javascript
	plugins:[
		//定义全局常量(内部插件)
		webpack.DefinePlugin({      
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
		'process.env.VUE_ENV': '"server"'
	      }),
	]
	```
	HotModuleReplacementPlugin (--hot)  
	MinChunkSizePlugin (--optimize-min-chunk-size)  
	LimitChunkCountPlugin (--optimize-max-chunks)  
	webpackJsonp (--output-jsonp-function)  
	UglifyJsPlugin (--optimize-minimize)  
	LoaderOptionsPlugin (--optimize-minimize)    

	###### 自定义pulgin

	```javascript
	//一、
	ConsoleLogOnBuildWebpackPlugin.prototype.apply = function(compiler) {
		compiler.plugin('run', function(compiler, callback) {
			console.log("webpack 构建过程开始！！！");
			callback();
		});
	};
	//二、hook
	let compiler = webpack(require('./webpack.config.js'));
	compiler.apply(new webpack.ProgressPlugin());
	compiler.run(function(err, stats) {
	// ...
	});
	```

	事件  
	run：开始编译      
	make：从entry开始递归分析依赖并对依赖进行build  
		--> build-moodule：使用loader加载文件并build模块  
		--> normal-module-loader：对loader加载的文件用acorn编译，生成抽象语法树AST  
		--> program：开始对AST进行遍历，当遇到require时触发call require事件  
		--> seal：所有依赖build完成，开始对chunk进行优化（抽取公共模块、加hash等）  
		--> optimize-chunk-assets：压缩代码  
	emit：把各个chunk输出到结果文件  

	###### 第三方plugin

	1、html-webpack-plugin  
	为html文件中引入的外部资源如script、link动态添加每次compile后的hash，防止引用缓存的外部文件问题  
	可以生成创建html入口文件，比如单页面可以生成一个html文件入口，配置N个html-webpack-plugin可以生成N个页面入口  
	将 webpack中`entry`配置的相关入口thunk  和  `extract-text-webpack-plugin`抽取的css样式   
	插入到该插件提供的`template`或者`templateContent`配置项指定的内容基础上生成一个html文件， 
	具体插入方式是将样式`link`插入到`head`元素中，`script`插入到`head`或者`body`中。 

	```javascript
	var HtmlWebpackPlugin = require('html-webpack-plugin')
	webpackconfig = {
	    ...
	    plugins: [
		new HtmlWebpackPlugin({
			//template指定你生成的文件所依赖哪一个html文件模板，模板类型可以是html、jade、ejs等。但是要注意的是，如果想使用自定义的
			template: path.join(__dirname, 'default_index.ejs'), 
			templateParameters: templateParametersGenerator,
			//filename就是生成html文件的文件名
			filename: 'index.html',
			hash: false,
			//inject有四个值： true body head false
				//true 默认值，script标签位于html文件的 body 底部
				//body script标签位于html文件的 body 底部
				//head script标签位于html文件的 head中
				//false 不插入生成的js文件，这个几乎不会用到的
			inject: true,
			compile: true,
			//favicon给你生成的html文件生成一个 favicon,值是一个路径
			favicon: false,
			//minify使用minify会对生成的html文件进行压缩
			// { removeAttributeQuotes: true // 移除属性的引号 }注minify: true , 这样会报错
			minify: false,
			//cache默认是true的，表示内容变化的时候生成一个新的文件。
			cache: true,
			//showErrors当webpack报错的时候，会把错误信息包裹再一个pre中
			showErrors: true,
			//chunks chunks主要用于多入口文件；chunks: ['index','main'】编译后：
			//<script type=text/javascript src="index.js"></script>
			//<script type=text/javascript src="main.js"></script>
			chunks: 'all',
			//excludeChunks excludeChunks: ['devor.js']排除掉一些js
			excludeChunks: [],
			//chunksSortMode script的顺序，默认四个选项： none auto dependency {function}
				//'dependency' 不用说，按照不同文件的依赖关系来排序。
				//'auto' 默认值，插件的内置的排序方式，具体顺序....
				//'none' 无序？
				//{function} 提供一个函数？
			chunksSortMode: 'auto',
			meta: {},
			//生成html文件的标题
			title: 'Webpack App',
			//xhtml一个布尔值，默认值是 false ，如果为 true ,则以兼容 xhtml 的模式引用文件
			xhtml: false
		})
	    ]
	}
	```

	2、extract-text-webpack-plugin

	3、mini-css-extract-plugin

	如果需要提取vue文件style到一个单独的文件的话就需要这样配置
	```javascript
	const MiniCssExtractPlugin = require("mini-css-extract-plugin");
	webpackconfig = {
	    ...
	    plugins: [
		    new MiniCssExtractPlugin({
		      filename: "[name].css",
		      chunkFilename: "[id].css"
		    })
	    ]
	```

##### resolve

	解决require和import路径问题

	```javascript
	resolve：{
	alias: {
	    'vue$': 'vue/dist/vue.js'//$表示结尾的意思，意思就是匹配vue,如果没有$表示可以匹配vue这个单词
	}
	},
	```

##### devtool

	eval 默认值	每个module会封装到 eval 里包裹起来执行，并且会在末尾追加注释 //@ sourceURL. 
	```javascript
	eval("console.log(\"test\")\n\n//# sourceURL=webpack:///./src/index.js?");
	```
	source-map	生成一个SourceMap文件.  
	hidden-source-map	和 source-map 一样，但不会在 bundle 末尾追加注释.  
	inline-source-map	生成一个 DataUrl 形式的 SourceMap 文件.  
	eval-source-map	每个module会通过eval()来执行，并且生成一个DataUrl形式的SourceMap.  
	cheap-source-map	生成一个没有列信息（column-mappings）的SourceMaps文件，不包含loader的 sourcemap（譬如 babel 的 sourcemap）  
	cheap-module-source-map	生成一个没有列信息（column-mappings）的SourceMaps文件，同时 loader 的 sourcemap 也被简化为只包含对应行的。  

	webpack 不仅支持这 7 种，而且它们还是可以任意组合上面的eval、inline、hidden关键字，就如文档所说，你可以设置 souremap 选项为 cheap-module-inline-source-map。
	cheap-module-eval-source-map
	cheap-module-hidden-source-map
	cheap-module-inline-source-map


##### mode

	"development" 不会混淆压缩打包
	"production" 默认值、混淆打包

	默认即没有entry也没有output的情况下，webpack会进行下列操作
	1、entry就会找到"./src/index.js",
	mode:"production"并且混淆压缩的方式

##### target

	node 表示运行环境为node

##### externals

	表示不需要打包

	global - 外部 library 能够作为全局变量使用。用户可以通过在 script 标签中引入来实现。这是 externals 的默认设置。

	commonjs - 用户(consumer)应用程序可能使用 CommonJS 模块系统，因此外部 library 应该使用 CommonJS 模块系统，并且应该是一个 CommonJS 模块。

	commonjs2 - 类似上面几行，但导出的是 module.exports.default。

	amd - 类似上面几行，但使用 AMD 模块系统。
	externals: {
	  "lodash": {
		commonjs: "lodash",//如果我们的库运行在Node.js环境中，import _ from 'lodash'等价于const _ = require('lodash')
		commonjs2: "lodash",//同上
		amd: "lodash",//如果我们的库使用require.js等加载,等价于 define(["lodash"], factory);
		root: "_"//如果我们的库在浏览器中使用，需要提供一个全局的变量‘_’，等价于 var _ = (window._) or (_);
	  }
	}
	externals配置就是为了使import _ from 'lodash'这句代码，在本身不引入lodash的情况下，能够在各个环境都能解释执行
	externals引入jquery后，那么不管在代码中使用import $ from 'jquery'还是var $ = require('jquery');,这些代码都能在浏览器中很好的执行

##### 打包原理

	```javascript
	//原理利用表达式包裹模板
	!function(){//arguments}(module1,module2)
	//将函数内的require替换为 
	modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	//最终返回
	return module.exports;
	```	


##### cli命令说明

	$ webpack --config webpack.config2.js 使用另一份配置文件（比如webpack.config2.js）来打包
	$ webpack --watch, $ webpack -w//监听变动并自动打包
	$ webpack -p//压缩混淆脚本，这个非常非常重要！
	$ webpack -d//生成map映射文件，告知哪些模块被最终打包到哪里了其中的
	$ webpack --progress //显示进度条
	$ webpack --color,$ webpack -c //添加颜色
	$ webpack --profile #输出性能数据，可以看到每一步的耗时
	$ webpack --display-modules #默认情况下 node_modules 下的模块会被隐藏，加上这个参数可以显示这些被隐藏的模块

	  --context
	  --entry
	  --module-bind
	  --module-bind-post
	  --module-bind-pre
	  --output-path
	  --output-file
	  --output-chunk-file
	  --output-named-chunk-file
	  --output-source-map-file
	  --output-public-path
	  --output-jsonp-function
	  --output-pathinfo
	  --output-library
	  --output-library-target
	  --records-input-path
	  --records-output-path
	  --records-path
	  --define
	  --target
	  --cache      [default: true]
	  --watch-aggregate-timeout
	  --watch-poll
	  --hot
	  --debug
	  --devtool
	  --progress
	  --resolve-alias
	  --resolve-loader-alias
	  --optimize-max-chunks
	  --optimize-min-chunk-size
	  --optimize-minimize
	  --optimize-occurence-order
	  --optimize-dedupe
	  --prefetch
	  --provide
	  --labeled-modules
	  --plugin
	  --bail
	  --json, -j
	  --sort-modules-by
	  --sort-chunks-by
	  --sort-assets-by
	  --hide-modules
	  --display-exclude
	  --display-chunks
	  --display-error-details
	  --display-origins
	  --display-cached
	  --display-cached-assets
	  --display-reasons, --verbose, -v


