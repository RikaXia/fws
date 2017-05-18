'use strict';
const fs = require('fs-extra');
const path = require('path');

const babel = require("babel-core");
const preset_es2015 = require("babel-preset-es2015");
const preset_stage_0 = require("babel-preset-stage-0");

const tip = require('./tip');                   //提示消息
const pathInfo = require('./getPathInfo');      //获取目标路径信息

/**
 * es转js
 * 
 * @param {object} option
 * src:'',
 * dist:'',
 * debug:true,
 * callback:fun
 */
class Es2js{
    constructor(option){
        const _ts = this;
        option = option || {};

        _ts.config = {};

        for(let i in option){
            _ts.config[i] = option[i];
        };

        _ts.config.debug = _ts.config.debug ? 'inline' : false;

        _ts.fileInfo = pathInfo(_ts.config.src);

        if(_ts.fileInfo.extension === '.es' || _ts.fileInfo.extension === '.es6'){
            _ts.init();
        }else{
            tip.error(_ts.src + ' 不是有效的"es"或"es6"文件');
        };        
    }
    init(){
        const _ts = this;

        let config = _ts.config,
            fileType = path.extname(config.src),
            fileName = path.basename(config.src,fileType),
            src = config.src,
            dist;
        //开始处理编译
        if(config.dist){
            dist = config.dist;
        }else{
            dist = path.join(path.dirname(file),fileName+'.js');
        };

        let result = babel.transformFileSync(src,{
            presets:[preset_es2015,preset_stage_0],
            sourceMaps:config.debug
        });

        if(result.code){
            //创建文件
            fs.ensureDir(path.dirname(dist),(err)=>{
                if(err){
                    tip.error(err);
                }else{
                    fs.writeFileSync(dist,result.code);
                    tip.success(dist + ' 输出成功');
                    
                    //处理回调
                    if(typeof config.callback === 'function'){
                        config.callback();
                    };
                };
            });
        };            
    }
}

module.exports = Es2js;