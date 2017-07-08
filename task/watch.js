/// <reference path="../typings/globals/node/index.d.ts" />
'use strict';
class Watch{
    constructor(projectPath,options){
        const _ts = this;

        //任务依赖模块
        _ts.m = {
           path:require('path'),
           chokidar:require('chokidar'),
           os:require('os'),
           fs:require('fs-extra'),
           autoRefresh:require('../lib/autoRefresh'),   //自动刷新
           openurl:require('openurl'),                  //打开前台页面
           tip:require('../lib/tip'),                   //文字提示
           pathInfo:require('../lib/getPathInfo'),      //判断文件或目录是否存在
           Compile:require('../lib/compile')            //编译文件
        };

        //任务配置
        _ts.config = {
            // path:'E:/src',                              //项目目录
            // browse:false                                //开启监听后，是否打开项目页面
        };

        _ts.config.path = projectPath || _ts.m.path.join(fws.cmdPath,'src');
        _ts.config.browse = options.browse;             //浏览器打开项目


        _ts.nonPublic = {};                             //保存非"_"开始的公共文件
        //_ts.server = new _ts.m.autoRefresh();           //socket server
    }

    /**
     * 任务初始入口
     */
    init(){
        const _ts = this,
            config = _ts.config,
            m = _ts.m;

        console.log(_ts.getLocalIp());    
    }

    /**
     * 创建方法
     */
    start(){
        const _ts = this;


    }

    /**
     * 编译项目指定类型的所有文件
     */
    compileTypeFile(type){
        const _ts = this,
            config = _ts.config,
            m = _ts.m;
        
        let server = new m.autoRefresh();           //socket server

        for(let i in _ts.nonPublic[type]){
            new m.Compile({
                'src':i,            //输入文件
                'dist':undefined,   //输出模块，不指定由编译模块处理
                'debug':true,       //开启debug模式，会生成map并编译到dev目录
                'callback':(result)=>{
                    _ts.server.io.broadcast('refresh',result);
                }
            });
        };
    }

    /**
     * 检查当前目录是一个fws工程目录
     */
    check(){
        const _ts = this,
            config = _ts.config,
            m = _ts.m;
        return m.pathInfo(fws.srcPath).type === 'dir';
    }

    /**
     * 获取本地IP地址
     */
    getLocalIp(){
        const _ts = this,
            config = _ts.config,
            m = _ts.m;
        
        let networkInfo = m.os.networkInterfaces(),
            ip;
        for(let i in networkInfo){
            let t = networkInfo[i].some((item,index)=>{
                if(item.family === 'IPv4' && item.address !== '127.0.0.1' && item.address !== '0.0.0.0'){
                    ip = item.address;
                    return true;;
                };
            });
            if(t){
                break;
            };
        };
        return ip ? ip : 'localhost';
    }


    
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'项目监听编译',
        option:[
            ['-b, --browse','浏览器访问项目']
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Watch
    }
};