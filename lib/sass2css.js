'use strict';
/**
 * scss编译为css
 * 
 * @class Pug2html
 * {
 *  src:'',                 scss文件路径
 *  dist:'',                css输出路径
 *  debug:true,             debug模式将格式化样式，生成map
 *  callback:()=>{}         回调
 * }
 */
class Sass2css{
    constructor(option){
        const _ts = this;
        _ts.m = {
            fs:require('fs-extra'),
            path:require('path'),
            sass:require('node-sass'),
            tip:require('./tip'),
            pathInfo:require('./getPathInfo')
        };

        option = option || {};

        for(let i in option){
            _ts[i] = option[i];
        };

        _ts.debug = _ts.debug === undefined ? true : _ts.debug;

        if(_ts.m.pathInfo(_ts.src).extension === '.scss'){
            _ts.init();
        }else{
            _ts.m.tip.error(_ts.src + ' 不是有效的scss文件')
        };

    }
    init(){
        const _ts = this;
        let outFileName = _ts.m.path.basename(_ts.dist),
            option = {
                file:_ts.src
            };

        if(_ts.debug){
            option.sourceMap = true;
            option.outFile = outFileName;
            option.outputStyle = 'nested';
        }else{
            option.sourceMap = undefined;
            option.outputStyle = 'compressed';
        };

        _ts.m.sass.render(option,(err,result)=>{
            if(err){
                _ts.m.tip.error(err);
            }else{
                _ts.m.fs.ensureDir(_ts.m.path.dirname(_ts.dist),(err)=>{
                    if(err){
                        _ts.m.tip.error(err);
                    }else{
                        //生成编译出的css文件
                        _ts.m.fs.writeFileSync(_ts.dist,result.css);
                        _ts.m.tip.success(_ts.dist + ' 输出成功');

                        //生成map文件
                        if(result.map){
                            let mapPath = _ts.dist + '.map';
                            _ts.m.fs.writeFileSync(mapPath,result.map);
                            _ts.m.tip.success(mapPath + ' 输出成功');
                        };

                        if(typeof _ts.callback === 'function'){
                            _ts.callback();
                        };
                    };
                });
            };
        });

    }
}

module.exports = Sass2css;



