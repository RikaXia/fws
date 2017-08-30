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
                rollup_jsx:require('rollup-plugin-jsx'),
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
        
        return new Promise((resolve,reject)=>{
            //检查文件是否为有效的类型
            let isSupport = (()=>{
                    let extensions = ['js','es','es6','ts','tsx','jsx'],
                        fileType = m.pathInfo(config.src).extension;
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
        
        let c = m.path.join(fws.srcPath,'ts_config.json');
        console.log(c);

        //编译方法
        let render = (resolve,reject)=>{
            m.rollup.rollup({
                entry:config.src,
                plugins:[
                    //允许引入json文件
                    m.rollup_json(),
                    
                    //允许引入node模块
                    m.rollup_nodeResolve({
                        jsnext:true,
                        main:true
                    }),
                    
                    m.rollup_bable({
                        presets:[require('babel-preset-react'),require('babel-preset-stage-0')]
                    }),
                    
                    m.rollup_typescript({
                        typescript:require('typescript'),
                        tsconfig:false,
                        jsx:'react'
                    }),

                    //由于node_modules大多数包都是CommonJS规范，因此需要
                    m.rollup_commonjs()
                    
                ]
            }).then(v => {

                

                
                let result = v.generate({
                    //format:'umd',
                    sourceMap:true
                });

                console.log(result)

                let map = '//# sourceMappingURL=data:application/json;charset=utf-8;base64,'+new Buffer(JSON.stringify(result.map)).toString('base64');

                m.fs.writeFileSync(config.dist,result.code + map)

                // v.write({
                //     format:'umd',
                //     sourceMap:'inline',
                //     dest:config.dist
                // })
            });
        };

        return new Promise(render);
    }
}
module.exports = Es2;
