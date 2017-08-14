'use strict';
/**
 * 文件编译处理
 * 
 * @class Compile
 * {
 *  src:'',                 //输入文件
 *  dist:undefined,         //输出模块，不指定由编译模块处理
 *  debug:true              //开启debug模式，会生成map并编译到dev目录
 * }
 */
class Compile{
    constructor(option){
        const _ts = this;

        option = option || {};

        let m = _ts.m = {
                fs:require('fs-extra'),
                path:require('path'),
                pathInfo:require('./getPathInfo'),
                tip:require('./tip')
            },
            config = _ts.config = {};

        //配置写入到_ts.config
        for(let i in option){
            config[i] = option[i];
        };

        //默认开启debug模式
        config.debug = config.debug === undefined ? true : config.debug;

        //确定传入的文件是有效的再开始处理
        if(m.pathInfo(config.src).type === 'file'){
            _ts.init();
        }else{
            m.tip.error(config.src + ' 文件不存在');
        };
    }
    
    init(){
        const _ts = this;
        let config = _ts.config;

        //得到文件的类型、名称、以及首字母        
        config.fileType = m.path.extname(config.src).toLowerCase();                      //文件类型
        config.fileName = m.path.basename(config.src,config.fileType);                   //文件名称
        config.filePrefix = _ts.fileName ? _ts.fileName.substr(0,1) : undefined;         //得取文件第一个字符，用于决定是否为公共文件

        //设置输出目录
        _ts.setDist();

        //开始编译
        try {
            _ts.compile();
        } catch (error) {
            m.tip.error(error);
        };

    }
    /**
     * 编译
     * @memberOf Compile
     */
    compile(){
        const _ts = this;
        
    }

    /**
     * 设置输出目录路径
     * @memberOf Compile
     */
    setDist(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        //声明类型编译对应关系
        let inOutFileType = {
                '.pug':'.html',
                '.scss':'.css',
                '.ts':'.js',                
                '.tsx':'.jsx',
                '.jsx':'.js',
                '.es':'.js',
                '.es6':'.js'
            },
            outExtName = ;


    }
};


module.exports = Compile;



