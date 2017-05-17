'use strict';
// const fs = require('fs');
const fs = require('fs-extra');
const path = require('path');
const ts = require('typescript');
const pathInfo = require('./getPathInfo');
const tip = require('./tip');

/**
 * tsx、ts编译为jsx、js
 * 
 * @class Pug2html
 * {
 *  src:'',                 tsx、ts文件路径
 *  dist:'',                jsx、js输出路径
 *  debug:true,             debug模式将生成map文件
 *  callback:()=>{}         回调
 * }
 */
class Ts2{
    constructor(option){
        const _ts = this;

        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };

        _ts.debug = _ts.debug === undefined ? true : _ts.debug;

        let srcInfo = pathInfo(_ts.src);
        if(srcInfo.extension === '.tsx' || srcInfo.extension === '.ts'){
            _ts.init();
        }else{
            tip.error(_ts.src + ' 不是有效的"tsx"或"ts"文件');
        };      
    }
    init(){
        const _ts = this;

        //编译选项
        let option = {
                alwaysStrict:true,              //是否启用严格模式
                lib: ts.ScriptTarget.ES2015,    //编译库
                module:'ES2015',                //代码生成规范
                sourceMap:_ts.debug,            //生成map文件
                //sourceRoot:'',                //源文件位置              
                //inlineSourceMap:true,           //在文件中嵌入map信息
                // inlineSources:true              //生成源码图，需要inlineSourceMap开启
            },
            srcFileName = path.basename(_ts.src),
            fileContent = fs.readFileSync(_ts.src).toString();
        
        //开始编译
        let result = ts.transpileModule(
            fileContent,
            {
                compilerOptions:option,
                //moduleName:"test",
                fileName:srcFileName
            }
        );

        //将结果写入文件
        fs.ensureDir(path.dirname(_ts.dist),(err)=>{
            if(err){
                tip.error(err);
            }else{
                fs.writeFileSync(_ts.dist,result.outputText);
                tip.success(_ts.dist + ' 输出成功');

                if(result.sourceMapText){
                    let mapPath = _ts.dist + '.map';
                    fs.writeFileSync(mapPath,result.sourceMapText);
                    tip.success(mapPath + ' 输出成功');
                };

                if(typeof _ts.callback === 'function'){
                    _ts.callback();
                };
            };
        });
    }
}

module.exports = Ts2;


// let ts2js = (src,dist,isDebug)=>{
//     let fileContent = fs.readFileSync(src).toString(),
//         srcFileName = path.basename(src);
    

//     //设置编译选项
//     let option = {
//         alwaysStrict:true,              //是否启用严格模式
//         lib: ts.ScriptTarget.ES2015,    //编译库
//         module:'ES2015',                //代码生成规范
//         sourceMap:true,                 //生成map文件
//         //sourceRoot:'',                //源文件位置              
//         //inlineSourceMap:true,           //在文件中嵌入map信息
//         // inlineSources:true              //生成源码图，需要inlineSourceMap开启

//     };

//     //开始编译
//     var result = ts.transpileModule(
//         fileContent,
//         {
//             compilerOptions:option,
//             //moduleName:"test",
//             fileName:srcFileName
//         }
//     );

//     //将编译结果写入到文件
//     //mdDir(dist);

//     fs.ensureDir(path.dirname(dist),(err)=>{
//         if(err){
//             tip.error(err);
//         }else{            
//             fs.writeFileSync(dist,result.outputText);
//             tip.success(dist+' 输出成功');

//             if(result.sourceMapText){
//                 fs.writeFileSync(dist+'.map',result.sourceMapText);
//                 tip.success(dist+'.map 输出成功');
//             };
//         };
//     })
//     //console.log(result);
    
// };



// module.exports = ts2js;