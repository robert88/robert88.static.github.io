var exec = require('child_process').exec,
    path = require('path'),
    os   = require('os');
    fs   = require('fs'),
    cwd = process.cwd();
// HACK: to make our calls to exec() testable,
// support using a mock shell instead of a real shell
var shell = process.env.SHELL || 'sh';

// support for Win32 outside Cygwin
if (os.platform() === 'win32' && process.env.SHELL === undefined) { 
  shell = process.env.COMSPEC || 'cmd.exe';
}

// Merges the current environment variables and custom params for the environment used by child_process.exec()
function createEnv(params) {
    var env = {};
    var item;

    for (item in process.env) {
        env[item] = process.env[item];
    }

    for(item in params) {
        env[item] = params[item];
    }

    return env;
}
const currentFileDir = __dirname.replace(/\\/g,"/");
const exeDir = path.resolve(currentFileDir,'../serverTool');
const exeTemplDir = path.resolve(currentFileDir,'../serverTempl');
const iconvFile = exeDir + "/iconv.exe";
var uuid = 0;
function converFileUTF8toGBK(file,callback){
    uuid++;
    var converTempPack = exeTemplDir+"/converCmd"+uuid+".bat";
    exec(iconvFile + " -f UTF-8 -t GBK " + file + " > " + converTempPack,
        {
            cwd: cwd,
            env: createEnv({})
        },
        function (error) {
            uuid--;
            // TODO any optional processing before invoking the callback
            callback(error, converTempPack);

        }
    )
}

global.rap = global.rap ||{config:{}};


rap.exec = async function(scriptFile,callback,workingDirectory,environment) {

    workingDirectory = workingDirectory || cwd;

    if(typeof callback!="function"){
        callback = function(e, stdout, stderr){if(e){console.log("cmd:",e,stdout, stderr)}}
    }

    if (!workingDirectory) {
        callback(new Error('workingDirectory cannot be null'), null, null);
    }

    if (!fs.existsSync(workingDirectory)) {
        callback(new Error('workingDirectory path not found - "' + workingDirectory + '"'), null, null);
    }

    if (scriptFile === null) {
        callback(new Error('scriptFile cannot be null'), null, null);
    }



    var existScriptFile = false;

    //等待异步执行

    await  new Promise((resolve) => {
        fs.exists(scriptFile,function (flag) {
                existScriptFile = flag;
                resolve(flag)
        });
    })

    //如果执行的是文件
    var cmd;
    if (existScriptFile) {
        // TODO: consider building the command line using a shell with the -c argument to run a command and exit
        //防止中文乱码
        await new Promise((resolve,reject) => {
            converFileUTF8toGBK(scriptFile,function(e,newScriptFile){
                if(e){
                    reject(e);
                }else{
                    cmd =newScriptFile;
                    resolve();
                }
            });
        })
    }else{
        cmd = scriptFile;
    }

    // transform windows backslashes to forward slashes for use in cygwin on windows
    if (path.sep === '\\') {
        cmd = cmd.replace(/\\/g, '/');
    }

    console.log("cmd执行：",cmd);
     await new Promise((resolve,reject) => {
         exec(cmd,
             {  shell:shell,
                 cwd: workingDirectory,
                 env: createEnv(environment||{})
             },
             function (error, stdout, stderr) {
                 // TODO any optional processing before invoking the callback
                 if(error){
                     reject(error)
                 }else{
                     callback();
                     resolve( stdout, stderr)
                 }
             }
         )
    });

}
