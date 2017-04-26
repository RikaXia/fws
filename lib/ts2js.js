'use strict';
const fs = require('fs');
const path = require('path');
const ts = require('typescript');


let ts2js = (src,dist,isDebug)=>{
    let fileContent = fs.readFileSync(src).toString();

    //设置编译选项
    let option = {
        alwaysStrict:true,              //是否启用严格模式
        lib: ts.ScriptTarget.ES2015,    //编译库
        module:'ES2015',                //代码生成规范
        sourceMap:true,                 //生成map文件
        //sourceRoot:'',                //源文件位置              
        //inlineSourceMap:true,           //在文件中嵌入map信息
        // inlineSources:true              //生成源码图，需要inlineSourceMap开启

    };

    //开始编译
    var result = ts.transpileModule(
        fileContent,
        {
            compilerOptions:option,
            //moduleName:"test",
            fileName:"ts1.ts"
        }
    );

    //将编译结果写入到文件
    fs.writeFileSync(path.join(__dirname,'out.js'),result.outputText);

    console.log(result);
    
};



module.exports = ts2js;