var wake = require("./serverLib/rap.filesystem.js");

var files = wake.findFile(rap.config.actionPath, "js", true);

//获取指定action目录
exports = module.exports = {actionMap:{}};

exports.init=function(){

    var actionMap = {};
    var consleActionMap = [];

    function getActionHandler(key,subActionHandler,subMap){

        if (typeof subActionHandler == "function") {
            return subActionHandler;
        }else if(subMap[subActionHandler]){//同文档action映射
            return getActionHandler(subActionHandler,subMap[subActionHandler],subMap);
        }else{
            return subActionHandler;
        }
    }

    files.forEach(function (file) {

        //清除缓存
        delete require.cache[require.resolve(file)];

        //提取对象
        var subMap = require(file);

        //提取action前缀
        var action = file.replace(rap.config.actionPath, "").replace(/\.js$/i, "");

        //得到完整的action是当前文件
        if (typeof subMap == "function") {
            actionMap[action.toLowerCase()] = subMap;
            consleActionMap.push(action.toLowerCase());
        }else{
            //得到完整的action
            for (var key in subMap) {

                var actionKey = key.toLowerCase();

                //以/开始表示全路径，否则相对文件路径
                if(!key.indexOf("/")==0){
                    actionKey = (action + "/" + key).toLowerCase();
                }

                actionMap[actionKey] = getActionHandler(key,subMap[key],subMap);

                consleActionMap.push(actionKey)
            }
        }
    });

    rap.info("action map：",consleActionMap);
    consleActionMap = null;

    exports.actionMap=actionMap;
    return actionMap
}

rap.actionMap = exports.init();
