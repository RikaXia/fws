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
                //rollup_typescript:require('rollup-plugin-typescript'),
                //rollup_jsx:require('rollup-plugin-jsx'),
                //rollup_bable:require('rollup-plugin-babel'),
                replaceGlobal:require('./replaceGlobal'),
                pathInfo:require('./getPathInfo'),
                rollup_vue:require('rollup-plugin-vue')
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
            config = _ts.config,
            fileType = config.srcInfo.extension;

        //设置编译插件
        let plugins = [
            //允许引入json文件
            m.rollup_json(),

            //允许引入node模块
            m.rollup_nodeResolve({
                jsnext:true,
                main:true
            }),

            //由于node_modules大多数包都是CommonJS规范，因此需要
            m.rollup_commonjs()

        ];

        //项目类型是vue的话，则添加vue支持组件 
        if(fws.config.projectType === 'vue'){
            let cssPath = `dev/css/${config.srcInfo.name}.css`;
            plugins.push(m.rollup_vue({css:cssPath}))
        };

        //typescript编译选项
        let tsOption = {
            alwaysStrict:true,                      //是否启用严格模式
            lib:'ES3',                              //编译库'ES3','ES5','ES2015','ES2016','ES2017','Latest'
            module:'ES2015',                        //代码生成规范'None','CommonJs','AMD','UMD','System','ES2015'
            sourceMap:true                          //生成map文件
        };
        
        //react文件类型修改编译选项
        if(fileType === '.tsx' || fileType === '.jsx'){
            tsOption.jsx = 'react';
        };

        //将编译插件传递到插件列表
        plugins.push(require('./tsPlugin')(tsOption));

        //编译方法
        let render = (resolve,reject)=>{
            m.rollup.rollup({
                input:config.src,
                plugins:plugins
            }).then(v => {
                let format = (()=>{
                    if(config.srcInfo.extension === '.js'){
                        return 'es';
                    };
                    let fileContent = m.fs.readFileSync(config.src).toString();

                    if(/\nexport /ig.test(fileContent) || fileContent.indexOf('export ') === 0){
                        return 'umd';
                    }else{
                        return 'iife';
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
                    if(code){
                        code = m.replaceGlobal(code);
                    };
                    
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
