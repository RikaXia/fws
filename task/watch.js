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
        _ts.config.bowder = options.bower

        _ts.nonPublic = {};                             //保存非"_"开始的公共文件
        _ts.server = new _ts.m.autoRefresh();           //socket server
    }

    init(){
        const _ts = this,
            config = _ts.config,
            m = _ts.module;

        console.log(config);    
    }

    start(){
        const _ts = this;


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