'use strict';
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
        _ts.m ={
            fs:require('fs-extra'),
            path:require('path'),
            ts:require('typescript'),
            pathInfo:require('./getPathInfo'),
            tip:require('./tip')
        };

        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };

        _ts.debug = _ts.debug === undefined ? true : _ts.debug;

        let srcInfo = _ts.m.pathInfo(_ts.src);
        if(srcInfo.extension === '.tsx' || srcInfo.extension === '.ts'){
            try {
                _ts.init();
            } catch (error) {
                _ts.m.tip.error(error);
            };            
        }else{
            _ts.m.tip.error(_ts.src + ' 不是有效的"tsx"或"ts"文件');
        };      
    }
    init(){
        const _ts = this;
        //编译选项（https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API、https://www.typescriptlang.org/docs/handbook/compiler-options.html）
        let option = {
                alwaysStrict:true,                      //是否启用严格模式
                lib: _ts.m.ts.ScriptTarget.ES5,         //编译库'ES3','ES5','ES2015','ES2016','ES2017','Latest'
                module:_ts.m.ts.ModuleKind.None,        //代码生成规范'None','CommonJs','AMD','UMD','System','ES2015'
                sourceMap:_ts.debug,                    //生成map文件
                //emitDecoratorMetadata:true,
                experimentalDecorators:true,
                target:"ES5"
                //sourceRoot:'',                        //源文件位置              
                //inlineSourceMap:true,                   //在文件中嵌入map信息
                //inlineSources:true                      //生成源码图，需要inlineSourceMap开启
            },
            srcFileName = _ts.m.path.basename(_ts.src),
            fileContent = _ts.m.fs.readFileSync(_ts.src).toString();
        
        //开始编译
        let result = _ts.m.ts.transpileModule(
            fileContent,
            {
                compilerOptions:option,
                //moduleName:"test",
                fileName:srcFileName
            }
        );

        //将结果写入文件
        _ts.m.fs.ensureDir(_ts.m.path.dirname(_ts.dist),(err)=>{
            if(err){
                _ts.m.tip.error(err);
                if(typeof _ts.callback === 'function'){
                    _ts.callback({
                        status:'error',
                        path:_ts.dist
                    });
                };
            }else{
                _ts.m.fs.writeFileSync(_ts.dist,result.outputText);
                _ts.m.tip.success(_ts.dist + ' 输出成功');

                if(result.sourceMapText){
                    let mapPath = _ts.dist + '.map';
                    _ts.m.fs.writeFileSync(mapPath,result.sourceMapText);
                    _ts.m.tip.success(mapPath + ' 输出成功');
                };

                if(typeof _ts.callback === 'function'){
                    _ts.callback({
                        status:'success',
                        path:_ts.dist
                    });
                };
            };
        });
    }
}

module.exports = Ts2;