'use strict';
/**
 * scss编译为css
 * 
 * @class Pug2html
 * {
 *  src:'',                 <string> scss文件路径
 *  dist:'',                <string> css输出路径
 *  debug:true              [boolean] 默认:true，debug模式将格式化样式并生成有调试信息
 * }
 */
class Sass2css{
    constructor(option){
        const _ts = this;

        option = option || {};

        let m = _ts.m = {
                fs:require('fs-extra'),
                path:require('path'),
                sass:require('node-sass'),
                pathInfo:require('./getPathInfo')
            },
            config = _ts.config = {};

        //配置写入到_ts.config
        for(let i in option){
            config[i] = option[i];
        };

        //默认开启debug模式
        config.debug = config.debug === undefined ? true : config.debug;
        console.log(config.src)
        return new Promise((resolve,reject)=>{
            let fileType = m.pathInfo(config.src).extension;
            if(fileType === '.scss' || fileType === '.sass'){
                try {
                    _ts.init().then(v => {
                        resolve(v);
                    }).catch(e => {
                        reject(e);
                    });
                } catch (error) {
                    reject({
                        status:'error',
                        msg:`初始化失败 ${m.path.join(fwsPath,'lib','sass2css.js')}`,
                        info:error
                    });
                };
            }else{
                reject({
                    status:'error',
                    msg:typeof config.src === 'string' ? `${config.src} 不是有效的Sass文件` : `参数传入错误`
                });
            };
        });
    }
    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        //处理编译选项
        let option = {
            file:config.src
        };
        
        if(config.debug){
            option.sourceComments = true;
            option.outputStyle = 'nested';
        }else{
            option.sourceComments = false;
            option.outputStyle = 'compressed';
        };

        let sassRender = (resolve,reject)=>{
            m.sass.render(option,(err,result)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:`编译出错 ${config.src}`,
                        info:err
                    });
                };

                //创建目录并写入文件
                let distDir = m.path.dirname(config.dist);
                m.fs.ensureDir(distDir,err => {
                    if(err){
                        reject({
                            status:'error',
                            msg:`创建失败 ${distDir}`,
                            info:err
                        });
                    };
                    
                    //写入css文件
                    try {
                        m.fs.writeFileSync(config.dist,result.css);
                        resolve({
                            status:'success',
                            msg:`写入 ${config.dist}`,
                            data:result.css,
                        });
                    } catch (err) {
                        reject({
                            status:'error',
                            msg:`写入失败 ${config.dist}`,
                            info:err
                        });
                    };
                });

            });
        };

        return new Promise(sassRender);
    }
}
module.exports = Sass2css;
