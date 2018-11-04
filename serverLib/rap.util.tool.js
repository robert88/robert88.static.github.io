
/*对外接口*/
rap.isArray = function (obj) {
	return rap.type(obj) === "array";
};
rap.toArray = function (obj) {
	return rap.isArray(obj)?obj:[obj];
};
rap.isFunction = function (func) {
	return rap.type(func) == "function";
};
rap.type = function (obj) {
	var class2type = {
		"[object Array]":"array",
		"[object Null]":"null",
		"[object Function]":"function"
	}
	var toString = class2type.toString;
	if (obj == null) {
		return obj + "";
	}
	return typeof obj === "object" || typeof obj === "function" ?
	class2type[toString.call(obj)] || "object" :
		typeof obj;
};

rap.isWindow = function (obj) {
	/* jshint eqeqeq: false */
	return obj != null && obj == obj.window;
};
rap.isEmptyObject = function (obj) {
	var name;
	for (name in obj) {
		return false;
	}
	return true;
};

rap.isPlainObject = function (obj) {

	var class2type = {};

	// var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var support = {};

	var key;

	// Must be an Object.
	// Because of IE, we also have to check the presence of the constructor property.
	// Make sure that DOM nodes and window objects don't pass through, as well
	if (!obj || rap.type(obj) !== "object" || obj.nodeType || rap.isWindow(obj)) {
		return false;
	}

	try {
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
			return false;
		}
	} catch (e) {
		// IE8,9 Will throw exceptions on certain host objects #9897
		return false;
	}

	// Support: IE<9
	// Handle iteration over inherited properties before own properties.
	if (support.ownLast) {
		for (key in obj) {
			return hasOwn.call(obj, key);
		}
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	for (key in obj) {
	}

	return key === undefined || hasOwn.call(obj, key);
};


rap.extend = function () {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
		deep = target;

		// skip the boolean and the target
		target = arguments[i] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== "object" && !rap.isFunction(target)) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if (i === length) {
		target = this;
		i--;
	}

	for (; i < length; i++) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && ( rap.isPlainObject(copy) || (copyIsArray = rap.isArray(copy)) )) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && rap.isArray(src) ? src : [];

					} else {
						clone = src && rap.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = rap.extend(deep, clone, copy);

					// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};
/*
 * 判断非空对象
 * */
rap.isUnEmptyObject = function(obj) {
	return obj != null && typeof obj == "object"
};
/*
 * 类型代理函数
 * */
rap.proxyHander = function(proxy, objectCallback, nullCallback) {
	if (typeof proxy == "function") {
		return proxy.call(this);
	} else if (rap.isUnEmptyObject(proxy)) {
		return objectCallback.call(this, proxy)
	} else if (typeof proxy == "string") {
		return proxy;
	} else if (typeof nullCallback == "function") {
		return nullCallback.call(this);
	}
	return "";
};

/**
* 防止递归死循环设置20个层次
* */

function Count(){
	this.resursion_level = 0;
}
Count.prototype.out = function () {
	this.resursion_level--;
};
Count.prototype.in = function () {
	this.resursion_level++;
	if (this.resursion_level >= 20){
		return true;
	}
};

/**
 * 重新解析对象,JSON.stringify解析dom会报错，不能解析function
 * 带过滤功能
 * */
rap.stringify = function (obj,filter,space,count) {

	if(typeof obj=="object" && obj != null && !obj.nodeName){

		if(count==null){
			count = new Count();
		}
		if(count.in()){
			count.out();
			console.log("object level > 20");
			return "[object Object]"
		}

		var str = [];

		var isArrayFlag = rap.isArray(obj);


		for(var key in obj){

		    //过滤
			if( filter == "function" ){

				str.push( filter(key,obj[key]) || "");

			}else {


				var keyStr = isArrayFlag?"":( "\"" + key + "\":" );

				if(typeof obj[key]=="object"){

					str.push( keyStr + rap.stringify( obj[ key ],null,null,count ) );

				}else if(typeof  obj[key] == "function" ){

					str.push( keyStr+"\"{0}\"".tpl(Object.prototype.toString.call(obj[ key] ))  );

				}else if(typeof  obj[key] == "string" ){

					str.push( keyStr + "\"{0}\"".tpl( obj[ key ] )  );

				}else{
                    // "sdf:"+"{0}".tpl(undefined)
                    //"sdf:undefined"
                    // "sdf:"+"{0}".tpl(null)
                    // "sdf:null"
					str.push( keyStr + "{0}".tpl( obj[ key ] )  );

				}
			}

		}
		space = (space==null)?",":space;

		count.out();

		if(count.resursion_level==0){
			count=null;
		}

		return isArrayFlag?("["+str.join(space)+"]"):("{" + str.join(space) + "}");

	}else{

		return  obj+"";

	}

}

/**
* 语法树
*/
function getParentParse(index,token){
	if(index==0){
		return null;
	}else{
		let prevParse = token[index-1];
		if(prevParse.type=="start"&&prevParse.hasEnd && !prevParse.closeEnd){
			return prevParse
		}else{
			return getParentParse(index-1,token);
		}
	}
}

/**
* 语法词
*parse数据结构： {level:0,type:"none",match:"",tag:"",hasEnd:false,closeEnd:false,parent:null,startParse:null}
*/
function tokenizer(str){
	var token = [];
	//把开始和结尾分割为数组
	var splitStr = str.split(/(<[a-zA-Z]+[^>]*>|<\/[a-zA-Z]+\s*>)/);
	var deep = 0;//深度

	splitStr.forEach((parseStr,index)=>{

		let parse = {level:0,type:"none"};
		let prevParse;
		let singleTag = /br|input|hr/
		parse.match = parseStr;

		parse.parent = getParentParse(index,token);
		parse.level = (parse.parent&&(parse.parent.level+1))||0;
		
		deep = Math.max(parse.level,deep);
		
		//开始
		if(	/<([a-zA-Z]+)[^>]*>/.test(parseStr) ){
			parse.tag = RegExp.$1;
			parse.type ="start"
			if(!singleTag.test(parse.tag)){
				parse.hasEnd = true;
			}
		//结束
		}else if(/<\/([a-zA-Z]+)\s*>/.test(parseStr)){
			parse.tag = RegExp.$1;
			//如果tag不一致将忽略掉
			if(parse.parent&&parse.tag==parse.parent.tag){
				//结束标签需要跟随开始标签
				parse.startParse = parse.parent
				//需要关闭开始标签
				parse.startParse.closeEnd = true;
				parse.level = parse.startParse.level;
				parse.parent = null;
			}else{
				parse.startParse =null;
			}
			
			parse.type ="end"
		}

		token[index] = parse;
	});
	return token;

}

 tokenizer("test1 <root> <subRoot><li>test2</li></subRoot>test3<input />test4</root>")
/**
 * 树形结构变成字符串
 * */
function treeToStr(tree, originStr) {
	if (tree.subTree) {
		for (var i = 0; i < tree.children.length; i++) {
			var item = tree.subTree.children[i];
			originStr = originStr.slice(0, item.start) + item.text + originStr.slice(item.start, originStr.length)
		}
	}
	return treeToStr(tree.subTree, originStr)
	return originStr;
}
