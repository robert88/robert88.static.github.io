function ConsoleLogOnBuildWebpackPlugin() {

};

ConsoleLogOnBuildWebpackPlugin.prototype.apply = function(compiler) {
  compiler.plugin('run', function(compiler, callback) {
    console.log("webpack 构建过程开始！！！");
    callback();
  });
};
exports=module.exports=ConsoleLogOnBuildWebpackPlugin;
