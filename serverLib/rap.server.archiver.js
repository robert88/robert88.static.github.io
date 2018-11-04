// Added in: v0.9.4
var wakePromise = require("./rap.filesystem.promise");
var wake = require("./rap.filesystem");
require("./rap.process.cmd.js");
var pt = require("path")
/**
 * @constructor
 * @param {String} format The archive format to use.
 * @param {(CoreOptions|TransformOptions)} options See also {@link ZipOptions} and {@link TarOptions}.
 */
const currentFileDir = __dirname.replace(/\\/g,"/");
const exeDir = pt.resolve(currentFileDir,'../serverTool');
const exeTemplDir = pt.resolve(currentFileDir,'../serverTempl');
const winRARFile = exeDir + "/WinRAR.exe";
const iconvFile = exeDir + "/iconv.exe"
if(!wake.isExist(iconvFile)){
	console.log("archiver error:can not find :"+iconvFile)
}
if(!wake.isExist(winRARFile)){
	console.log("archiver error:can not find :"+winRARFile)
}

// iconv -f UTF-8 -t GBK tempPack1.bat > tempPack2.bat
var uuid=0;
var controlUuid=0;

class Archiver{


    constructor(){

    }
	 /**
     *outFile:打包之后的文件
     * packFiles：需要打包的文件
     * */
    pack(outFile,packFiles,callback){
         if(!outFile){
             console.log("archiver error:archiver moudle out file can not find;");
             return;
         }

         if(packFiles&& !Array.isArray(packFiles)){
             packFiles = [packFiles];
         }

         if(!packFiles||packFiles.length==0){
             console.log("archiver error:archiver moudle pack files can not find;");
             return;
         }

         uuid++;
         controlUuid ++;
         var lstTempPack = exeTemplDir+"/lstTempPack"+uuid+".lst";
         var converLstTempPack = exeTemplDir+"/converLstTempPack"+uuid+".lst";
         var packCmd = winRARFile +" a -y " + outFile +" @"+ converLstTempPack;

         //cmd执行文件必须是ansi不然中文会乱码
         return wakePromise.writeData(lstTempPack,packFiles.join("\r\n"))
             .then(()=>{
                 return rap.exec(iconvFile + " -f UTF-8 -t GBK " + lstTempPack + " > " + converLstTempPack);
             })
             .then(()=>{
                 this.resetUuid();
                 return rap.exec(packCmd);
             })
             .catch((e)=>{
                 console.log("archiver error:",e);
                 this.resetUuid();
             });
    }
    /**
     *outFile:解压存放路径
     * unpackFiles：解压文件
     * */
    unpack(unpackFile,outFile,callback){

        if(!outFile){
            console.log("archiver error:archiver moudle out file can not find;");
            return;
        }

        var packCmd = winRARFile +" x -y " + unpackFile + (outFile?(" "+outFile+"/"):"");

        console.log("archiver解压到",outFile?pt.resolve(outFile):unpackFile.replace(/\.rar$|.zip$/i,""));

        return rap.exec(packCmd);
    }


	
    resetUuid(callback){
        controlUuid--;
        if(controlUuid==0){
            uuid=0
        }
    }
}

exports = module.exports = function (opts,unpack) {
    return new Archiver();
}
