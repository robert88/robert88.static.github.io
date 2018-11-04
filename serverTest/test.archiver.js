var archiver = require("../serverLib/rap.server.archiver.js")();
// archiver.pack("E:/尹明/code/apach/rapServer/serverTest",["../doc/git域名绑定.docx"],function(){
// console.log("yaso")
// })
archiver.unpack("E:/尹明/code/apach/rapServer/serverTest.rar","E:/尹明/code/apach/rapServer").then(function () {
    console.log("ok")
}).catch(function (e) {
    console.log(e)
})
