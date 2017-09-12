'use strict';
/**
 * es、es6、js文件打包
 * 
 * @class Es2
 * {
 *  src:'',                 <string> 源文件路径
 *  dist:'',                <string> 输出路径
 *  debug:true              [boolean] 默认:true,debug模式将生成调试信息
 * }
 */
class Es2{
    constructor(option){
        const _ts = this;

        option = option || {};

        let m = _ts.m = {
                fs:require('fs-extra'),
                path:require('path'),
                rollup:require('rollup'),
                rollup_json:require('rollup-plugin-json'),
                rollup_nodeResolve:require('rollup-plugin-node-resolve'),
                rollup_commonjs:require('rollup-plugin-commonjs'),
                rollup_typescript:require('rollup-plugin-typescript'),
                //rollup_jsx:require('rollup-plugin-jsx'),
                rollup_bable:require('rollup-plugin-babel'),
                pathInfo:require('./getPathInfo')
            },            
            config = _ts.config = {};

        //配置写入到_ts.config
        for(let i in option){
            config[i] = option[i];
        };
        
        //默认开启debug模式
        config.debug = config.debug === undefined ? true : config.debug;

        config.srcInfo = m.pathInfo(config.src);
        
        return new Promise((resolve,reject)=>{
            //检查文件是否为有效的类型
            let isSupport = (()=>{
                    let extensions = ['js','es','es6','ts','tsx','jsx'],
                        fileType = config.srcInfo.extension;
                    return extensions.some((item,index)=>{
                        return fileType === '.'+item;
                    });
                })();
            if(isSupport){
                try {
                    _ts.init().then(v => {
                        resolve(v);
                    }).catch(e => {
                        reject(e);
                    });
                } catch (error) {
                    reject({
                        status:'error',
                        msg:`初始化失败 ${m.path.join(fwsPath,'lib','es2.js')}`,
                        info:error
                    });
                };             
            }else{
                reject({
                    status:'error',
                    msg:typeof config.src === 'string' ? `${config.src} 不是有效的文件` : `参数传入错误`
                });
            };
        });
    }

    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        //编译方法
        let render = (resolve,reject)=>{
            m.rollup.rollup({
                input:config.src,
                plugins:[
                    //允许引入json文件
                    m.rollup_json(),
                    
                    //允许引入node模块
                    m.rollup_nodeResolve({
                        jsnext:true,
                        main:true
                    }),

                    //由于node_modules大多数包都是CommonJS规范，因此需要
                    m.rollup_commonjs(),
                    
                    //babel扩展
                    m.rollup_bable({
                        presets:[
                            require('babel-preset-react'),              //react支持
                            require('babel-preset-es2015-rollup'),      //转为es2015                        
                            require('babel-preset-stage-0')             //转换do表达式，转换函数绑定符...
                        ],
                        runtimeHelpers:true
                    }),
                    
                    //typescript扩展
                    m.rollup_typescript({
                        typescript:require('typescript'),
                        tsconfig:false,
                        jsx:'react'
                    })         
                ]
            }).then(v => {
                let format = (()=>{
                    if(config.srcInfo.extension === '.js'){
                        return 'es';
                    };
                    let fileContent = m.fs.readFileSync(config.src).toString();
                    if(fileContent.indexOf('define(') > -1){
                        return 'es';
                    }else{
                        return 'umd';
                    };
                })();
                //设置文件输出选项
                let result = v.generate({
                    format:format,          //amd、cjs、es、iife、umd
                    sourcemap:true,
                    name:config.srcInfo.name//模块名即输入的文件名
                });

                //输出文件
                result.then(v => {     
                    let code = v.code,
                        map = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,'+new Buffer(JSON.stringify(v.map)).toString('base64'),
                        outCode,
                        distDir = m.path.dirname(config.dist);                    
                    
                    //将代码转换成为兼容cmd和hjs的规范
                    code = code.replace("typeof define === 'function' && define.amd ? define(factory) :","typeof define === 'function' && define.amd ? define(factory) : \r\n	typeof define === 'function' && (define.cmd || define.hjs) ? define(function(require,exports,module){module.exports = factory()}) :");

                    outCode = config.debug ? code + map : code;
                    
                        //写入文件到硬盘
                    m.fs.ensureDir(distDir,err => {
                        if(err){
                            reject({
                                status:'error',
                                msg:`${distDir} 创建错误`,
                                info:err
                            });
                        }else{
                            try {
                                m.fs.writeFileSync(config.dist,outCode);
                                resolve({
                                    status:'success',
                                    msg:`写入 ${config.dist}`,
                                    distPath:config.dist,
                                    data:outCode
                                });
                            } catch (error) {
                                reject({
                                    status:'error',
                                    msg:`写入失败 ${config.dist}`,
                                    distPath:config.dist,
                                    info:error
                                });
                            };
                        };
                    });
                }).catch(e => {
                    reject({
                        status:'error',
                        msg:`${config.src} 编译结果出错`,
                        info:e
                    });
                });
            }).catch(e => {
                reject({
                    status:'error',
                    msg:`${config.src} 编译过程错误`,
                    info:e
                });
            });
        };

        return new Promise(render);
    }
}
module.exports = Es2;
