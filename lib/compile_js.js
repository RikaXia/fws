'use strict';
/**
 * js文件处理
 * - js文件压缩
 * - 文件签名
 * 
 * @class Compile
 * {
 *  src:'',                 <string> 源文件路径
 *  dist:'',                <string> 输出路径
 * }
 */
class Compile{
    constructor(option){
        const _ts = this;

        option = option || {};

        let m = _ts.m = {
                fs:require('fs-extra'),
                path:require('path'),
                UglifyJS:require('uglify-js'),
                pathInfo:require('../lib/getPathInfo'),
                signature:require('../lib/signature')
            },            
            config = _ts.config = {};

        //配置写入到_ts.config
        for(let i in option){
            config[i] = option[i];
        };
        let src = config.src,
            dist = config.dist;

        return _ts.taskList();
    }

    taskList(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        return new Promise((resolve,reject)=>{
            let js,              //js内容               
                signature,       //签名
                miniJs;
            
            //读取文件内容
            if(m.pathInfo(config.src).extension === '.js'){
                js = m.fs.readFileSync(config.src).toString();
                signature = m.signature('.js');

                //压缩之后的js
                miniJs = m.UglifyJS.minify(js,{
                    fromString:true,
                    compress:{
                        screw_ie8:false                         //支持ie6-8
                    },
                    mangle:{
                        except:['$','require','exports'],       //忽略的关键字
                        screw_ie8:false                         //支持ie6-8
                    }
                }).code;

                js = signature + miniJs;            
            }else{
                reject({
                    status:'error',
                    msg:`${config.src} 不是有效的 JS 文件`
                });
            };            

            //写入文件之前先创建好对应的目录
            let distDir = m.path.dirname(config.dist);

            m.fs.ensureDir(distDir,err => {
                if(err){
                    reject({
                        status:'error',
                        msg:`${distDir} 创建失败`,
                        info:err
                    });
                };

                //写入文件
                try{
                    m.fs.writeFileSync(config.dist,js);
                    resolve({
                        status:'success',
                        msg:`写入 ${config.dist}`,
                        data:js
                    });
                }catch(err){
                    reject({
                        status:'error',
                        msg:`${config.dist} 创建失败`,
                        info:err
                    });
                };                    
            })
        });
    }
}
module.exports = Compile;
