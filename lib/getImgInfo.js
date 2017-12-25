/**
 * 获取图片信息，支持png、jpg、jpeg、gif
 * 
 * @param {any} imgPath
 * @returns 
 * 
 * @memberOf Watch
 */
module.exports = (imgPath)=>{
    const path = require('path'),
        fs = require('fs-extra'),
        Pixelsmith = require('pixelsmith'),
        pathInfo = require('./getPathInfo');

    let pix = new Pixelsmith(),
        imgInfo = {};
    
    return new Promise((resolve,reject)=>{
        pix.createImages([imgPath],(err,imgs)=>{
            if(err){
                reject({
                    'status':'error',
                    'msg':`${imgPath} 信息获取错误`,
                    'data':err
                });
                return;
            };
            let img = imgs[0],
                info = pathInfo(imgPath);
            imgInfo.width = img.width;
            imgInfo.height = img.height;
            imgInfo.base64 = fs.readFileSync(imgPath).toString('base64');
            imgInfo.name = info.name;
            imgInfo.type = info.extension.replace(/\./g,'');
            imgInfo.path = imgPath;

            resolve({
                'status':'success',
                'msg':`${imgPath} 信息获取成功`,
                'data':imgInfo
            });
        });
    });
};