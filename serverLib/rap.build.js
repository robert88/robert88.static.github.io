/*
*定义href的链接
*/
require("./rap.util.color.js");
require("./rap.util.prototype.js");
var wake = require("./rap.filesystem.js");
var image = require("./images.js");
var pt = require("path");
var fs = require("fs");
/**
 * 拷
 * * */
var huaweiSVN = "E:/尹明/code/enterPrise_huawei/UAT/enterprise/Uat版本/20171020";
var rootDir = __dirname.replace("build\\lib","").replace("build/lib","");
var www3 = "\\\\10.68.63.195\\wamp\\www3";


exports = module.exports = {
    /**
     * 提供全局的方法href
     * */
    href:function(value){
        return value?('href="'+value+'"'):'';
    },

    /**
     *指定目录查询文件的路径，没找到返回空
     */
    searchFile:function(fileName,dir){
        var addr="";
        var fileList = wake.findFile(dir,pt.extname(fileName).replace(".",""),true);
        fileList.forEach(function (val) {
            if(pt.basename(fileName)==pt.basename(val)){
                addr = val;
                return false;
            }
        })
        return addr;
    },
    /**
     *返回图片的scale效果
     */
    scaleImage:function (value,sizeAttr) {
        if(value){
            var localFile = searchFile(value,"../images");
            if(wake.isExist( localFile )){
                console.log("scaleImage find :"+localFile.green)
                var size = image(fs.readFileSync(localFile))
                if(sizeAttr){
                    return "data-"+sizeAttr+"=\""+value+"\" "+"data-"+sizeAttr+"-size=\""+size.width+"x"+size.height+"\""
                }else{
                    return "href=\""+value+"\" data-size=\""+size.width+"x"+size.height+"\""
                }
            }else{
                console.log("scaleImage find :"+localFile.red)
                return ""
            }
        }else{
            return "";
        }
    },
    /**
     *根据内容的个数提供布局方式
     */
    getCol:function(length){
        if(length){
            return"col"+(12%length==0?(12/length):('0'+(10/length)))
        }
        return "col"
    },
    /**
     *根据内容的个数提供布局方式
     */
    fill:function (value,perfix) {
        perfix = perfix || "00"
        var len = value.length;
        if (len < 0) {
            return value + "";
        } else {
            return  (perfix+value).slice(-perfix.length);
        }
    },
    /**
     *模板引擎
     */
    templ:function(json,templStr){
        var includeReg = splitNotReplace(templStr,/<script[^>]*>[\u0000-\uFFFF]*?<\/script>/gmi);

        includeReg.forEach(function (str,idx) {
            if(!/^<script/.test(str)){
                includeReg[idx] = parseHtml(str);
            }else{
                includeReg[idx] =  str.replace(/\\/g,"\\\\").replace(/(\n|\r)+/g,"\\n").replace(/("|')/g,"\\\$1").replace(/\n/g,"\"+\n\"")
            }
        });

        templStr = includeReg.join("")
        try{
            var result = "with(obj){ debugger;var t =\""+templStr.replace(/\+$/,"")+"\"} return t;"
            //return result;
            var fn = new Function("obj",result);
        }catch (e){
            return result;
            console.log("error template".red,e);
        }
        var retHtml =  fn(json);
        var cssArr = [];
        var jsArr = [];
        //将隐藏的样式去掉
        retHtml =  retHtml.replace(/<!--[\u0000-\uFFFF]*?-->/gmi,function (m) {
            //ie预编译器
            if(~m.indexOf("[endif]")){
                return m;
            }else{
                m= m.replace(/<link[^>]*>/gmi,"")
            }
            return m;
            //只在body里面提取
        }).replace(/<body[^>]*>[\u0000-\uFFFF]*?<\/body>/gmi,function (m) {
            m=m.replace(/<link[^>]*>/gmi,function (m) {
                cssArr.push(m);
                return "";
            });
            m=m.replace(/<script([^>]*)>\s*?<\/script>/gmi,function (m,m1) {
                if(~m1.indexOf("src")&&m1.indexOf("data-not-move")==-1){
                    jsArr.push(m);
                }else{
                    return m.replace("data-not-move","");
                }
                return "";
            });
            return m;
        })

        cssArr = unique(cssArr);
        jsArr = unique(jsArr)
        // 写到head下面或者指定位置

        if(~retHtml.indexOf("<include id='link'></include>")){
            retHtml = retHtml.replace("<include id='link'></include>",function(){return cssArr.join("\n")})
        }else if(~retHtml.indexOf("</head>")){
            retHtml = retHtml.replace(/<\/head>/i,function () {return (cssArr.join("\n")+"</head>") })
        }else{
            console.log("error:html is not has </head>".red)
        }

        if(~retHtml.indexOf("<include id='script'></include>")){
            retHtml = retHtml.replace("<include id='script'></include>",function(){return jsArr.join("\n")})
        }else if(~retHtml.indexOf("</body>")){
            retHtml = retHtml.replace(/<\/body>/i,function () {return (jsArr.join("\n")+"</body>") })
        }else{
            console.log("error:html is not has </body>".red)
        }

        return retHtml

    },
    /**
     *copy
     */
    copy:function(src,dir){
        for(var i in dir){
            src[i] = dir[i];
        }
    },
    /**
     *copy不覆盖
     */
    copyByAdd:function(src,dir){
        for(var i in dir){
            if(src[i]==null){
                src[i] = dir[i];
            }
        }
    },
    /**
     对外接口
     */
   handleIncludeFile:function(file,outPath,watchFile){
        wake.writeData(outPath, handleOneFile(file,watchFile));
    },
    /**
     * 获取.{lang}.js的数据
     * */
    getLangData:function(abDataPath,matchLang){
       var ret = {};
        if(wake.isExist(abDataPath)){
            //清除缓存
            delete require.cache[require.resolve(abDataPath)];
            ret = require(abDataPath)
            ret.lang = matchLang;
        }else{
            ret.lang= matchLang;
        }
        return ret;
    },
    /**
     * 获取语言配置
     * */
    getLangByFile:function(file){
        var fileName = pt.basename(file);
        var filedir = pt.dirname(file);
        var lang = {};
        var matchLang

        if(/\.([a-z]+)\.html$/.test(fileName)){
             matchLang = RegExp.$1;
            var abDataPath = file.replace(fileName,fileName.replace(".{0}.html".tpl(matchLang),".{0}.js".tpl(matchLang)));//中文导出文件模板数据
            lang[matchLang] = exports.getLangData(abDataPath,matchLang);
        }else{

            wake.findFile(filedir,"js").forEach(function (jsFile) {
                if(/\.([a-z]+)\.js$/.test(jsFile)){
                     matchLang = RegExp.$1;
                    var jsFileName = pt.basename(jsFile);
                    if(jsFileName.replace(".{0}.js".tpl(matchLang),".html")==fileName){
                        lang[matchLang] = exports.getLangData(jsFile,matchLang);
                    }
                }
            })
            if(this.isEmptyObject(lang)){
                lang["cn"] = {lang:"cn"};
            }
        }
        return lang;

    },
    /**
     * 是否是空对象
     * */
    isEmptyObject:function(obj){
        for(var i in obj){
            return false;
        }
        return true;
    },
    /**
     * 拷贝文件
     * */
    moveHtmlToSVN: function(lang,fileDir){
        wake.writeData(huaweiSVNHtml+"/EBGPage/"+lang+"/"+fileDir,wake.readData("../"+lang+"/"+fileDir));
    },
    /**
     * 将文件拷贝到www3目录
     * */
    copyFileToWWW: function(fileDir){
        wake.writeData(www3+"/Assets/enp/v2"+fileDir,wake.readData(rootDir+"/Assets/enp/v2"+fileDir));
        console.log("copy file:".red,rootDir+"/Assets/enp/v2"+fileDir,"to".green,www3+"/Assets/enp/v2"+fileDir)
    },
    /**
     * 将目录拷贝到www3目录
     * */
    copyFileToWWWByRoot:function(fileDir){
        wake.writeData(www3+fileDir,wake.readData(rootDir+fileDir));
        console.log("copy file:".red,rootDir+fileDir,"to".green,www3+fileDir)
    },
    copyDirToWWW:function(dir){
        wake.copyDir((rootDir+"/Assets/enp/v2"+dir).toURI(),(www3+"/Assets/enp/v2"+dir).replace(/\//g,"\\"));
        console.log("copy dir:".red,(rootDir+"/Assets/enp/v2"+dir).toURI(),"to".green,(www3+"/Assets/enp/v2"+dir).replace(/\//g,"\\"));
    },
    /**
     * 将目录拷贝到www3目录
     * */
    copyDirToWWWByRoot:function(dir){
        wake.copyDir((rootDir+dir).toURI(),(www3+dir).replace(/\//g,"\\"));
        console.log("copy dir:".red,(rootDir+dir).toURI(),"to".green,(www3+dir).replace(/\//g,"\\"));
    },
    /**
     *合并功能
     *@param : data配置数据
     *@param : 默认数据
     *@param ：fileList模板文件
     *@param ：callback处理html页面，非必填项
     */
    handleHTML:function(opt,watchFile){
        var configFile = opt.data,
            conmonFile = opt.defaultData,
            tempArr = opt.fileList,
            outFileDir = opt.outDir,
            outFile = opt.outFile,
            handleHtml = opt.callback,
            filename = opt.filename;

        watchFile =  watchFile||[];

        var config = {};
        //公共数据
        if(typeof conmonFile=="string"){
            //清除缓存
            delete require.cache[require.resolve(conmonFile)];
            exports.copy(config,require(conmonFile));
            watchFile.push(conmonFile.toURI())
        }else  if(conmonFile){
            exports.copy(config,conmonFile);
        }

        //特殊数据
        if(typeof configFile=="string"){
            //清除缓存
            delete require.cache[require.resolve(configFile)];
            exports.copy(config, require(configFile));
            watchFile.push(configFile.toURI())
        }else if(configFile){
            exports.copy(config,configFile);
        }

        //优先选用命令行中的行中的文件名
        config.filename = config.filename||filename;

        Object.defineProperties(watchFile,{
            include:{
                enumerable:false,
                writable: true
            }
        })
        watchFile.include=function (incluedFile) {
            var lang = exports.getLangByFile(incluedFile);
            exports.copyByAdd(config,lang[config.lang||"en"]);
        }
        var setHtml="";
//合并多个html
        tempArr.forEach(function(val){
            setHtml+= handleOneFile(val,watchFile);
        });


        if(typeof handleHtml=="function"){
            setHtml = handleHtml(setHtml);
            if(typeof  setHtml==null){
                console.log("error callback must return string".red);
                return;
            }
        }


        var lastData = templ(config,setHtml);

        var outFileName = outFile || ( outFileDir+(filename||config.filename)+".html")
        wake.writeData(outFileName,lastData);
    }

}

global.moveHtmlToSVN=exports.moveHtmlToSVN
global.copyFileToWWW=exports.copyFileToWWW
global.copyDirToWWW=exports.copyDirToWWW
global.copyFileToWWWByRoot=exports.copyFileToWWWByRoot
global.copyDirToWWWByRoot=exports.copyDirToWWWByRoot
global.getLangByFile= exports.getLangByFile;
global.href = exports.href;
global.searchFile =exports.searchFile;
global.scaleImage=exports.scaleImage;
global.getCol=exports.getCol;
global.fill =exports.fill;
global.templ=exports.templ;
global.copy=exports.copy;
global.handleIncludeFile=exports.handleIncludeFile
global.isEmptyObject=exports.isEmptyObject
global.handleHTML=exports.handleHTML
global.watch=watch

/**
 *分割但是不替换
 */
function splitNotReplace(c,reg){
    var a=[];var d=0;c.replace(reg,function(m,m1){a.push(c.slice(d,m1));d=m1+m.length;a.push(m);});if(d<c.length){a.push(c.slice(d,c.length))}
    return a;
}
/**
 *分割script标签
 */
function parseHtml(templStr) {
    templStr = templStr.replace(/\\/g,"\\\\").replace(/(\n|\r)+/g,"\\n").replace(/("|')/g,"\\\$1").replace(/\n/g,"\"+\n\"")
    //templStr = templStr.replace(/\\/g,"\\\\").replace(/("|')/g,"\\\$1").replace(/\n/g,"\"+\n\"")

    //循环
        .replace(/\{\{#each\s+([^}]+)\s*\}\}/g,function(m,m1){
            return "\"+(function(){try{var $length ="+m1+"&&"+m1+".length; var t=\"\";"+m1+"&&"+m1+".forEach(function($value,$index){ \n t+= \""
        })
        .replace(/\{\{#endEach\s*\}\}/g,"\"});return t;}catch(e){console.warn(e&&e.stack)}}()) +\"")
        //ifelse
        .replace(/\{\{#if\s+([^}]+)\s*\}\}/g,function(m,m1){
            return "\"; try{if("+m1.replace(/\\/g,"")+"){ t+=\""
        }).replace(/\{\{#elseIf\s+([^}]+)\s*\}\}/gi,function(m,m1){
            return "\"; }else if("+m1.replace(/\\/g,"")+"){ t+=\""
        }).replace(/\{\{#else\s*\}\}/g,function(m,m1){
            return "\";}else{ t+=\""
        }).replace(/\{\{#endIf\s*\}\}/gi,function(m,m1){
            return "\"}}catch(e){console.warn(e&&e.stack)} t+=\""
        })
        //变量
        .replace(/\{\{\s*([^}]+)\s*\}\}/g,function(m,m1){
            return "\"+"+m1.replace(/\\/g,"")+"+\""
        })
    return templStr;
}


function unique(results){
    var cache ={};
    var arr = [];
    for(var i=0;i<results.length;i++){
        if(!cache[results[i]]){
            cache[results[i]] =1;
            arr.push(results[i])
        }
    }
    return arr;
}


/**
 处理单个文件,subFiles递归带过来的include html
 */
function handleOneFile(file,watchFile){

    var fileData = wake.readData(file);
    var includeReg = /<include[^>]*>([\u0000-\uFFFF]*?)<\/include>/gmi;
    var includeTags = fileData.match(includeReg);

    if(includeTags){
        for(var j=0;j<includeTags.length;j++){
            var includeFile = includeTags[j].match(/src='?"?([^'"]+)'?"?/);
            if(includeFile&&includeFile[0]&&includeFile[1]){
                includeFile = rootDir+includeFile[1];
                // console.log("find Include FILE:".green,includeFile);
                watchFile.include(includeFile);
                watchFile.push(includeFile.toURI());
                fileData = replaceIncludeHtml(fileData,includeTags[j],includeFile,watchFile)
            }
        }
    }
    return fileData;
}
/**替换单个html
 */
function replaceIncludeHtml(currFileData,includeTag,includeFile,watchFile){
    var fileData = wake.readData(includeFile);
    var includeReg = /<include[^>]*>([\u0000-\uFFFF]*?)<\/include>/gmi;
    var subIncludeTag = fileData.match(includeReg);
    if(subIncludeTag){
        currFileData = currFileData.replace(includeTag,handleOneFile(includeFile,watchFile))
    }else{
        currFileData = currFileData.replace(includeTag,fileData)
    }
    return currFileData;
}

/**
 *
 * 编译文件
 */
function compile(file,matchArr){
    var fileName = pt.basename(file);
    var langConfig =  getLangByFile(file);
    for (var lang in langConfig) {
        var data = langConfig[lang];
        var outFile = file.replace("build", lang).replace(".{0}.html".tpl(lang), ".html");;//导出文件
        var inFile = fileName.replace(".{0}.html".tpl(lang), ".html");
        matchArr.push(file);
        console.log("编译：".yellow, file)
        handleHTML({
            data: data,
            fileName: inFile,
            defaultData: rootDir + "/build/common/common.{0}.js".tpl(lang),
            fileList: [file],
            outFile: outFile,
            callback: null
        },matchArr);
        console.log("生成：".green, outFile);
    }

}

/**
 *
 * 监听文件
 */
var g_matchFile = {};
var g_watcher = {};
function watch(path){
    var absolutePath = rootDir + path;
    var needCompileFile = wake.findFile(absolutePath, "html", true);
    var filterTemplate = needCompileFile.filter(function (file) {
        if (file.indexOf("/template/") == -1) {
            return true;
        }
        return false;
    })

    filterTemplate.forEach(function (file) {
        g_matchFile[file] = [];
        compile(file, g_matchFile[file]);
    })
    // //监听文件夹变化
    var dirs = wake.findDir(absolutePath);
    addWatch(absolutePath);
    dirs.forEach(function (dir) {
        addWatch(dir);
    })
    updateWatchFile();
}
/**
 *
 * 如果文件在监听的文件夹中就不用监听了
 */
function checkDirWatch(file,child) {

    var parentDir = pt.dirname(file);
    if(g_watcher[parentDir]){
        return true;
    }else if(child==parentDir){
        return false;
    }else{
        return checkDirWatch(parentDir,file);
    }
}

/**
 *
 * 添加监听文件
 */
function addWatch(absolutePath){

    if(g_watcher[absolutePath]){
        return;
    }
    if(checkDirWatch(absolutePath)){
        return;
    }
    g_watcher[absolutePath] = fs.watch(absolutePath,function(type,file){
        var selfAbsolution
        if(wake.isExist(absolutePath)&&wake.isDir(absolutePath)){
            selfAbsolution = absolutePath+"/"+file;
        }else{
            selfAbsolution = absolutePath;
        }
        if(selfAbsolution.indexOf("___jb_tmp___")==-1&&selfAbsolution.indexOf("___jb_old___")==-1){
            if(type=="rename"&& wake.isExist(selfAbsolution)&&wake.isDir(selfAbsolution)){
                console.log("[watch add dir]:".yellow,type.green,selfAbsolution);
                addWatch(selfAbsolution);
            }else if(type=="change"&& wake.isExist(selfAbsolution)&&wake.isFile(selfAbsolution)){
                console.log("[watch]:".yellow,type.green,selfAbsolution);
                triggerMatchFile(selfAbsolution);
            }
        }

    })
}
/**
 *
 *添加文件监听
 */
function updateWatchFile(fileIndex){
    if(fileIndex){
        updateWatchFileArr(fileIndex)
    }else{
        for( fileIndex in g_matchFile){
            updateWatchFileArr(fileIndex)
        }
    }
}
/**
 *
 *添加文件监听
 */
function updateWatchFileArr(fileIndex) {
    var file
    for(var i=0;i<g_matchFile[fileIndex].length;i++){
        file = g_matchFile[fileIndex][i];
        addWatch(file);
    }
}
/**
 *
 *去掉监听
 */
function unwatchFile(fileIndex){
    if(fileIndex){
        unwatchFileArr(fileIndex)
    }else{
        for( fileIndex in g_matchFile){
            unwatchFileArr(fileIndex)
        }
    }
}
/**
 *
 *去掉监听
 */
function unwatchFileArr(fileIndex){
    var file
    for(var i=0;i<g_matchFile[fileIndex].length;i++){
        file = g_matchFile[fileIndex][i];
        if(g_watcher[file]){
            g_watcher[file].close()
        }
    }
}
/**
 *
 *文件改变触发事件
 */

function triggerMatchFile(file){

    var  fileIndexArr = findMatchWatchFileIndex(file);
    for(var i=0;i<fileIndexArr.length;i++){
        var fileIndex = fileIndexArr[i];
        triggerCompile(fileIndex);
    }
}
/**
 *
 *文件改变触发重新编译
 */
var matchTimer={};
function triggerCompile(fileIndex){
    clearTimeout(matchTimer[fileIndex]);
    matchTimer[fileIndex] = setTimeout(function () {
        console.log("compile...".yellow)
        unwatchFile(fileIndex)
        compile(fileIndex,g_matchFile[fileIndex]);
        updateWatchFile(fileIndex)
    },500)
}
/**
 *
 *找到需要编译的文件
 */
function findMatchWatchFileIndex(file){
    var ret = [];
    for(var fileIndex in g_matchFile){
        if(~g_matchFile[fileIndex].indexOf(file)){
            ret.push(fileIndex);
        }
    }
    return ret;
}
