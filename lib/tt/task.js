const ts = require('typescript');
const fs = require('fs');
const path = require('path');



let file = path.join(__dirname,'ts1.ts');
let fileContent = fs.readFileSync(file).toString();
let option = {
    alwaysStrict:true,              //是否启用严格模式
    lib: ts.ScriptTarget.ES2015,    //编译库
    module:'ES2015',                //代码生成规范
    sourceMap:true,                 //生成map文件
    //sourceRoot:'',                //源文件位置              
    //inlineSourceMap:true,           //在文件中嵌入map信息
    // inlineSources:true              //生成源码图，需要inlineSourceMap开启

};

var source = "let a = '测试';";
var result = ts.transpileModule(
    fileContent,
    {
        compilerOptions:option,
        //moduleName:"test",
        fileName:"ts1.ts"
    }
);

fs.writeFileSync(path.join(__dirname,'out.js'),result.outputText);

console.log(result);