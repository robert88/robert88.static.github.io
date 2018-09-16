/*打印webpack生命周期*/
const compilerHandler = function () {
console.log("引用自定義pulgin");
}
//
compilerHandler.prototype.apply=function (compiler) {
  console.log("添加hook");
  compiler.plugin('run', function(compiler, callback) {
    console.log("webpack run：开始！！！");
    callback();
  });
  compiler.plugin('make', function(compiler, callback) {
    console.log("webpack make：构建！！！");
    callback();
  });

  compiler.plugin('emit', function(compiler, callback) {
    console.log("webpack emit：输出！！！");
    callback();
  });
}
exports=module.exports=compilerHandler;
