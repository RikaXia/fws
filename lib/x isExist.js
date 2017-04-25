'use strict';
const fs = require('fs');

/**
 * 检查目标路径内目录或文件是否存在
 * @param {string} name 文件或目录名称
 * @param {string} path 目标路径
 */
let fileIsExist = (name,path)=>{
    let dirList = fs.readdirSync(path);

    return dirList.some((item,index)=>{
        return item === name;
    });
};

module.exports = fileIsExist;



