/**
 * 获取指定文件的相关信息
 * 
 * @param {string} filePath 
 * @returns 
 * 
 * @memberOf Watch
 */
module.exports = (filePath)=>{
    const {path} = {
        path:require('path')
    };

    let tempObj = {};

    tempObj.path = filePath;
    tempObj.type = path.extname(filePath).toLowerCase();          //文件扩展名，例如：".png"
    tempObj.name = path.basename(filePath,tempObj.type);          //文件名称不包含扩展名
    tempObj.isPublic = tempObj.name.substr(0,1) === '_';            //取文件名第一个字符,判断是否为公共文件 
    return tempObj; 
};