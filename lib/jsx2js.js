'use strict';
/**
 * jsx转js
 * 
 * @param {object} option
 * src:'',
 * dist:'',
 * debug:true,
 * callback:fun
 */
class Jsx2js{
    constructor(option){
        const _ts = this;
        _ts.m = {
            fs:require('fs-extra'),
            path:require('path'),
            babel:require("babel-core"),
            _ts.m.preset_react:require("babel-preset-react"),
            preset_es2015:require("babel-preset-es2015"),
            preset_stage_0:require("babel-preset-stage-0"),
            syntax_jsx:require("babel-plugin-syntax-jsx"),
            tip:require('./tip'),                                   //提示消息
            pathInfo:require('./getPathInfo')                       //获取目标路径信息
        };

        option = option || {};

        _ts.config = {};

        for(let i in option){
            _ts.config[i] = option[i];
        };

        _ts.config.debug = _ts.config.debug ? 'inline' : false;

        if(_ts.m.pathInfo(_ts.config.src).extension === '.jsx'){
            _ts.init();
        }else{
            _ts.m.tip.error(_ts.config.src+' 不是有效的".jsx"文件');
        };
    }
    init(){
        const _ts = this;

        let config = _ts.config,
            fileType = _ts.m.path.extname(config.src),
            fileName = _ts.m.path.basename(config.src,fileType),
            src = config.src,
            dist;
        //开始处理编译
        if(config.dist){
            dist = config.dist;
        }else{
            dist = _ts.m.path.join(_ts.m.path.dirname(file),fileName+'.js');
        };

        let result = _ts.m.babel.transformFileSync(src,{
            presets:[_ts.m.preset_react,_ts.m.preset_es2015,_ts.m.preset_stage_0],
            plugins:[_ts.m.syntax_jsx],
            sourceMaps:config.debug
        });

        if(result.code){
            //创建文件
            _ts.m.fs.ensureDir(_ts.m.path.dirname(dist),(err)=>{
                if(err){
                    _ts.m.tip.error(err);
                }else{
                    _ts.m.fs.writeFileSync(dist,result.code);
                    _ts.m.tip.success(dist + ' 输出成功');
                    
                    //处理回调
                    if(typeof config.callback === 'function'){
                        config.callback();
                    };
                };
            });
        };
    }
}

module.exports = Jsx2js;



