'use strict';
const fs = require('fs-extra');
const path = require('path');

const browserify = require('browserify');
const babelify = require('babelify');
const exorcist = require('exorcist');

const tip = require('./tip');                   //提示消息
const pathInfo = require('./getPathInfo');      //获取目标路径信息


/**
 * jsx转js
 * 
 * @param {object} option
 * src:'',
 * dist:'',
 * debug:true,
 * callback:fun
 */
class Vue2js{
    constructor(option){
        const _ts = this;
        option = option || {};

        _ts.config = {};

        for(let i in option){
            _ts.config[i] = option[i];
        };

        _ts.init();
    }
    init(){
        const _ts = this;

        let config = _ts.config,
            fileInfo = pathInfo(config.src),
            fileName = fileInfo.name,
            file = config.src,
            dist;
        

        if(fileInfo.type === 'file' && fileInfo.extension === '.jsx'){
            //开始处理编译
            if(config.dist){
                dist = config.dist;
            }else{
                dist = path.join(path.dirname(file),fileName+'.js');
            };

            //编译依赖
            let es2015 = require('babel-preset-es2015'),
                stage_0 = require('babel-preset-stage-0'),
                transform_react_jsx = require('babel-plugin-transform-react-jsx');
            
            //输出选项
            let entr = {
                entries:file,
                debug:config.debug === true ? true : false
            };            
                        
            let task = browserify(entr).transform(babelify,{
                    presets:[es2015,stage_0],
                    plugins:[transform_react_jsx],
                    sourceMaps:false
                }).bundle();
            
            //创建文件
            fs.ensureDir(path.dirname(dist),(err)=>{
                if(err){
                    tip.error(err);
                }else{
                    if(config.debug){
                        let mapDist = dist + '.map';
                        task.pipe(exorcist(mapDist));
                        tip.success(mapDist+' 输出成功')
                    };
                    task.pipe(fs.createWriteStream(dist));
                    tip.success(dist+' 输出成功');

                    //处理回调
                    if(typeof config.callback === 'function'){
                        config.callback(dist);
                    };
                };
            });   
        }else{
            tip.error(file+' 不是有效的".jsx"文件');
        };
    }
}

module.exports = Vue2js;



