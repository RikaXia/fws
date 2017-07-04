/// <reference path="../typings/globals/node/index.d.ts" />
'use strict';
const fs = require('fs-extra');

let aConfigDirList = fs.readdirSync(fws.tplConfigPath),//获取配置目录所有文件列表
    aConfigList = [],
    re = /^(\w*)(.json)$/i;

aConfigDirList.forEach((item,index)=>{
    if(re.test(item)){
        aConfigList.push(item.substr(0,item.length - 5));
    };
});

class create{
    constructor(name,options){
        const _ts = this;

        //任务依赖模块
        _ts.m = {
            path:require('path'),
            tip:require('../lib/tip'),                  //文字提示
            getType:require('../lib/getType'),          //获取数据类型
            pathInfo:require('../lib/getPathInfo'),     //获取目标路径的相关信息
            lineLog:require('single-line-log').stdout   //同一行打印文本
        };

        //任务配置
        _ts.config = {
            // name:'demo',                                //<string>,项目名称
            // template:'default'                          //<string>,项目配置文件名
        };
        _ts.config.name = name;

        _ts.config.template = typeof options.template === 'string' ? options.template : 'default';

        _ts.starTime = new Date();
    }

    /**
     * 任务初始入口
     */
    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        // let pList = Promise.all(_ts.start());

        // pList.then(val => {
        //     console.log(val);
        // }).catch(err => {
        //     console.log(err);
        // });
        
        let f = async ()=>{
            let pList = _ts.start();
            for(let i of pList){
                await i;
            };

            return '项目【'+config.name+'】创建成功。用时'+ (new Date() - _ts.starTime) + 'ms';
        };

        f().then(v => {
            m.tip.highlight('========================================');
            m.tip.highlight(v);
            m.tip.highlight('========================================');
        }).catch(err => {
            m.tip.error(err);
        });
    }

    /**
     * 创建方法
     */
    start(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        //初始化相关目录
        let initDir;
        (initDir = ()=>{

            //获取设置项目的相关目录信息
            let projectPath = m.path.join(fws.cmdPath,config.name);

            fws.srcPath = m.path.join(projectPath,'src');
            fws.devPath = m.path.join(projectPath,'dev');
            fws.distPath = m.path.join(projectPath,'dist');

            //创建目录
            fs.mkdirSync(projectPath);
            m.tip.success('创建 '+projectPath);

            fs.mkdirSync(fws.srcPath);
            m.tip.success('创建 '+fws.srcPath);

            fs.mkdirSync(fws.devPath);
            m.tip.success('创建 '+fws.devPath);

            fs.mkdirSync(fws.distPath);
            m.tip.success('创建 '+fws.distPath);

            //创建项目配置文件
            let fws_config = {
                author:fws.config.author,                           //作者
                mail:fws.config.mail,                               //邮箱
                projectName:config.name,                            //项目名称
                template:config.template,                           //模版
                //projectType:config.name.split('_')[0],              //模版类型
                createTime:new Date().valueOf(),                    //创建时间
                updater:undefined,                                  //更新者
                updateTime:undefined,                               //更新时间
                srcReplace:fws.config.srcReplace,                   //资源匹配对应关系
                srcSync:fws.config.srcSync,                         //src同步目录配置
                devSync:fws.config.devSync,                         //dev同步目录配置
                distSync:fws.config.distSync                        //dist同步目录配置
            },
                fwsConfigPath = m.path.join(projectPath,'fws_config.js');

            fws_config = `module.exports = ${JSON.stringify(fws_config,null,4)};`;

            fs.writeFileSync(fwsConfigPath,fws_config);
            m.tip.success('创建 '+fwsConfigPath);          
        })();

        //根据配置文件组织任务列表
        let initFiles,
            taskList = [];
        (initFiles = (dirPath,configData)=>{
            for(let i in configData){

                //得到当前路径
                let currentPath = m.path.join(dirPath);

                if(i === '__files__'){
                    configData[i].forEach((item,index)=>{
                        taskList.push({
                            src:m.path.join(fws.tplPath,item[0]),
                            target:m.path.join(currentPath,item[1])
                        });
                    });
                }else if(i !== '__name__'){
                    currentPath = m.path.join(currentPath,i);       //设置当前路径为新目录
                    fs.mkdirSync(currentPath);                      //创建目录
                    m.tip.success('创建 '+currentPath);

                    if(m.getType(configData[i]) === 'object'){
                        initFiles(currentPath,configData[i]);       //如果是目录则无限级循环
                    };
                };
            };
        })(fws.srcPath,_ts.getTemplate());

        return taskList.map((item,index)=>{
            return _ts.taskInit(item.src,item.target);
        });       

    }

    /**
     * 
     */
    taskInit(src,target){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        let srcInfo = m.pathInfo(src);

        return new Promise((resolve,reject)=>{
            if(srcInfo.type === 'file'){
                let readAble = fs.createReadStream(src),            //创建读取流
                    writAble = fs.createWriteStream(target);        //创建写入流
                readAble.pipe(writAble);                            //管道写入文件
                m.tip.success('创建 '+target);
                resolve({
                    status:'success',
                    path:target
                });
            }else if(srcInfo.type === 'dir'){

                //如果是目录，则将目录直接copy到对应的项目中
                target = m.path.join(target,srcInfo.name);
                m.tip.success('拷贝 '+target);
                fs.copy(src,target,err => {
                    if(err){
                        reject({
                            status:'error',
                            msg:err
                        });
                    }else{
                        resolve({
                            status:'success',
                            path:target
                        });
                    };
                });
            };
        });        
    }

    /**
     * 用于获取模版配置信息
     */
    getTemplate(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        let tplFilePath = m.path.join(fws.tplConfigPath,config.template+'.json'),
            tplConfig;
        
        if(m.pathInfo(tplFilePath).type === 'file'){
            tplConfig = JSON.parse(fs.readFileSync(tplFilePath));
        }else{
            throw new Error(tplFilePath + '不存在');
        };

        return tplConfig;
    }
};

module.exports = {
    regTask:{
        command:'[name]',
        description:'创建一个新的空项目',
        option:[
            ['-t, --template [template]','可选，指定项目类型，默认pc。可选参数 '+aConfigList.toString()]
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   如何自定义项目模版见 '+fws.tplPath);
        },
        action:create
    },
    fun:()=>{}
};