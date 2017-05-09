'use strict';
const fs = require('fs');
const path = require('path');
const pathInfo = require('./getPathInfo');     //获取目标路径的相关信息

/**
 * 根据路径创建目录（如果目录不存在）
 * 
 * @param {string} sPath 
 */
let mdDir = (sPath)=>{

    //将路径以分隔符拆开
    let adirName = sPath.split(path.sep);

    //如果路径是文件，那么剔除掉文件部分
    let lastName = adirName[adirName.length - 1];
    if(lastName.indexOf('.') > -1 || lastName === ''){
        adirName.pop();
    };

    //兼容linux、mac从根目录开始
    if(adirName[0] === ''){
        adirName[0] = '/';
    };

    //如果目录不存，则开始创建目录
    if(pathInfo(path.join.apply(null,adirName)).type !== 'dir'){
        //遍历处理好的路径，如果该目录不存在，则创建之
        let tempPath;
        adirName.forEach((item,index)=>{
            
            //路径递增
            tempPath = tempPath ? path.join(tempPath,item) : item;
            //console.log(tempPath)
            if(pathInfo(tempPath).type !== 'dir'){
                fs.mkdirSync(tempPath)
            };
        });
    };
};
module.exports = mdDir;