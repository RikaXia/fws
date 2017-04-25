'use strict';
const fs = require('fs');
const path = require('path');

const sass = require('node-sass');

const tip = require('./tip');                   //提示消息
const pathInfo = require('./getPathInfo');      //获取目标路径信息


/**
 * 
 * @param {string} src sass文件路径
 * @param {string} dist css输出路径
 * @param {boolean} isDebug 是否开启调试模式
 */
let sass2css = (src,dist,isDebug)=>{
    let outInfo = pathInfo(dist),
        outName = outInfo.name,
        outType = outInfo.extension,
        mapName = outName + outType,
        option = {};

    option.file = src;

    //设置编译选项
    if(isDebug){
        option.sourceMap = true;
        option.outFile = outName + outType;        
        option.outputStyle = 'nested';
    }else{
        option.sourceMap = undefined;
        option.outputStyle = 'compressed';
    };
    
    sass.render(option,(err,result)=>{
        if(err){
            tip.error(err);
        }else{

            //生成编译出的css文件
            fs.writeFile(dist,result.css,(err)=>{
                tip.success(`${dist}输出成功`);
            });
            
            //生成map文件
            if(result.map){
                fs.writeFile(path.resolve(dist,'..',mapName + '.map'),result.map,(err)=>{
                    tip.success(`${path.resolve('..',dist + '.map')}输出成功`);
                });
            };
        };
    });
};

module.exports = sass2css;



