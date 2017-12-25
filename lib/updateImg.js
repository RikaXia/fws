'use strict';
/**
 * 更新项目图片
 * 
 * @class Pug2html
 * {
 *  src:'',                 <string> 图片路径
 * }
 */
class UpdateImg{
    constructor(option){
        const _ts = this;

        let m = _ts.m = {
                path:require('path'),
                fs:require('fs-extra'),
                copy:require('./copy'),
                updateImgData:require('./updateImgData'),
                getImgInfo:require('./getImgInfo')
            },
            config = {};

        for(let i in option){
            config[i] = option[i];
        };

        let key = config.src.replace(fws.srcPath,'../').replace(/\\/g,'/');

        return new Promise((resolve,reject)=>{
            m.getImgInfo(config.src).then(v => {
                if(v.status === 'success'){
                    let data = v.data;

                    fws.ImgsData = fws.ImgsData || {};
                    fws.ImgsData[key] = {};
                    for(let i in data){
                        fws.ImgsData[key][i] = data[i];
                    };

                    // //拷贝文件
                    // new m.copy(config).then(v => {

                    // }).catch(e => {
                    //     reject(e);
                    // });

                    //将JSON对象转换成SASS对象并完成图片数据文件更新
                    m.updateImgData(fws.ImgsData).then(v => {
                        resolve(v);
                    }).catch(e => {
                        reject(e);
                    });
                };
            }).catch(e => {
                reject(e);
            });
        }); 
    }
};
module.exports = UpdateImg;