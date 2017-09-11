/// <reference path="../typings/globals/node/index.d.ts" />
'use strict';
class Watch{
    constructor(srcPath,options){
        const _ts = this;
        
        let m = _ts.m = {
                path:require('path'),
                chokidar:require('chokidar'),
                fs:require('fs-extra'),
                autoRefresh:require('../lib/autoRefresh'),              //自动刷新
                openurl:require('openurl'),                             //打开前台页面
                tip:require('../lib/tip'),                              //文字提示
                pathInfo:require('../lib/getPathInfo'),                 //判断文件或目录是否存在
                Compile:require('../lib/compile'),                      //编译文件
                isFwsDir:require('../lib/isFwsDir'),                    //判断是否为fws项目目录
                getDirFilesPath:require('../lib/getDirFilesPath'),      //获取目录文件数据
                isData:require('../lib/isData'),                        //判断是否为页面数据文件
                isSprite:require('../lib/isSprite'),                    //判断是否为精灵图数据
                getFileInfo:require('../lib/getFileInfo'),              //获取指定文件的相关信息
                getLocalIp:require('../lib/getLocalIp'),                //获取本机ip地址
                isFilter:require('../lib/isFilter'),                    //判断是否为需要忽略的文件
                getCompileFn:require('../lib/getCompileFn'),            //根据文件类型来获取编译方法
                getDistPath:require('../lib/getDistPath')
            },
            config = _ts.config = {},
            option = _ts.option = options;
        
        config.src = fws.srcPath = typeof srcPath === 'string' ? m.path.join(fws.cmdPath,srcPath,'src'+m.path.sep) : fws.srcPath;
        config.dev = fws.devPath = m.path.join(config.src,'..','dev'+m.path.sep);
        config.dist = fws.distPath = m.path.join(config.src,'..','dist'+m.path.sep);

    }
    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        let tasks = _ts.taskList(),
            f = async ()=>{
                for(let i=0,len=tasks.length; i<len; i++){
                    let task = await tasks[i]();
                    if(task.status === 'success'){
                        m.tip.success(task.msg);
                    };
                };
                return '不要关闭此进程。从现在开始，修改的项目文件将会自动编译。';
            };
        
        f().then(v => {
            console.log(v);
        }).catch(e => {
            m.tip.error(e.msg);
            console.log('error',e);
        });
        
    }
    taskList(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config,
            option = _ts.option;
        let tasks = [],
            isInitCompile,
            projectDir = m.path.join(config.src,'..');

        //检查项目是否为一个fws项目
        tasks.push(()=>{
            return new Promise((resolve,reject)=>{
                if(m.isFwsDir(projectDir)){
                    resolve({
                        status:'success',
                        msg:'检查目录为有效的 【FWS】 项目'
                    });
                }else{
                    reject({
                        status:'error',
                        msg:`${projectDir} 不是有效的fws项目目录`
                    });
                };
            });
        });

        //如果有开启快速模式，将不会预先编译项目
        if(!option.fast){
            //将初始化项目任务添加到任务列表
            let initCompileTasks = require('../lib/initCompile_dev')({
                src:fws.srcPath,
                dist:fws.devPath
            });

            tasks.push(...initCompileTasks);
        };

        //开启http服务
        var listenPort;
        if(option.server){
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{
                    _ts.server = new m.autoRefresh();
                    _ts.server.then(v => {
                        //保存端口号
                        listenPort = v.data.listenPort;

                        resolve(v);
                    }).catch(e => {
                        reject(e);
                    });
                    
                });
            });
        };

        //开启浏览服务
        if(option.browse){
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{
                    try {
                        if(listenPort){
                            m.openurl.open('http://'+m.getLocalIp()+':'+listenPort);
                            resolve({
                                status:'success',
                                msg:'浏览项目'
                            });
                        }else{
                            reject({
                                status:'error',
                                msg:'获取不到端口号',
                                info:listenPort
                            });
                        };                        
                    } catch (error) {
                        reject({
                            status:'error',
                            msg:'启动浏览器失败',
                            info:error
                        });
                    };
                });
            });
        };

        //监听文件
        tasks.push(()=>{
            return new Promise((resolve,reject)=>{
                try {
                    let w = m.chokidar.watch(config.src,{persistent:true}),
                        data = {};
                    
                    w.on('all',(stats,filePath)=>{
                        //是否为需要过滤的文件
                        let isFilter = m.isFilter(filePath);

                        if(!isFilter){
                            //是否为精灵图
                            let isSprite = m.isSprite(filePath),
                                isData = m.isData(filePath),
                                fileInfo = m.getFileInfo(filePath),
                                fileType = fileInfo.type,
                                fileName = fileInfo.name,
                                isPublic = fileInfo.isPublic,
                                key = isSprite ? '_sprite' : fileType,
                                temp,
                                compileFn = ()=>{
                                    let compile = m.getCompileFn(key),
                                        option = {
                                            debug:true
                                        },
                                        taskList = [];
                                    if(isSprite){
                                        //如果是精灵图，编译该精灵图对应的目录
                                        let srcDir = option.srcDir = m.path.dirname(filePath);

                                        option.distSpreiteDir = m.path.resolve(srcDir.replace(config.src,config.dev),'..');
                                        option.distScssDir = m.path.join(config.src,'css','_fws','sprite');
                                        taskList.push(()=>{
                                            return new compile(option);
                                        });
                                    }else if(isData){
                                        compile = m.getCompileFn('.pug');
                                        if(isPublic){
                                            //如果是数据公共文件,则编译所有的jade|pug文件
                                            let files = [],
                                                pugFiles = data['.pug'],
                                                jadeFiles = data['.jade'];
                                            
                                            //将pug和jade的文件添加到文件列表
                                            if(pugFiles){
                                                for(let i in pugFiles){
                                                    files.push(i);
                                                };
                                            };

                                            if(jadeFiles){
                                                for(let i in jadeFiles){
                                                    files.push(i);
                                                };
                                            };

                                            files.forEach((item,index)=>{
                                                option.src = item;
                                                option.dist = m.getDistPath(item,true);
                                                
                                                //根据jade|pug文件路径得到相对应的数据文件路径
                                                let srcInfo = m.getFileInfo(item),
                                                    dataPath = item.replace(
                                                        config.src,
                                                        m.path.join(config.src,'data'+m.path.sep)
                                                    );
                                                dataPath = m.path.join(
                                                        m.path.dirname(dataPath),
                                                        srcInfo.name+'.js'
                                                    );
                                                //检查对应的文件是否存在，如果存在则引入文件
                                                if(m.pathInfo(dataPath).extension === '.js'){
                                                    option.data = fws.require(dataPath);
                                                };

                                                taskList.push(()=>{
                                                    return new compile(option);
                                                });
                                            });
                                        }else{
                                            //非公共的数据文件,内里只编译与之相对应的jade|pug文件
                                            let files = [],

                                                //将与之对应的jade|pug文件路径添加到文件列表
                                                dirPath = filePath.replace(
                                                        m.path.join(config.src,'data'+m.path.sep),
                                                        config.src
                                                    );                                                
                                                files.push(m.path.join(
                                                    m.path.dirname(dirPath),
                                                    fileName+'.jade'
                                                ));
                                                files.push(m.path.join(
                                                    m.path.dirname(dirPath),
                                                    fileName+'.pug'
                                                ));
                                            
                                            //循环文件列表,并检查文件是否有效,如果有效则将编译任务添加到任务列表
                                            files.forEach((item,index)=>{
                                                if(m.pathInfo(item).extension){
                                                    option.src = item;
                                                    option.dist = m.getDistPath(item,true);
                                                    option.data = fws.require(filePath);

                                                    taskList.push(()=>{
                                                        return new compile(option);
                                                    });
                                                };
                                            });
                                        };
                                    }else if(isPublic && data[key]){
                                        //如果公共文件,且有同类型的文件则编译同类型所有文件
                                        for(let i in data[key]){
                                            option.src = i;
                                            option.dist = m.getDistPath(i,true);

                                            taskList.push(()=>{
                                                return new compile(option);
                                            });
                                        };

                                    }else{
                                        //只编译自身即可
                                        option.src = filePath;
                                        option.dist = m.getDistPath(filePath,true);
                                        
                                        if(fileType === '.pug' || fileType === '.jade'){

                                            //根据jade|pug文件路径得到相对应的数据文件路径
                                            let dataPath = filePath.replace(
                                                    config.src,
                                                    m.path.join(config.src,'data'+m.path.sep)
                                                );
                                            dataPath = m.path.join(
                                                    m.path.dirname(dataPath),
                                                    fileInfo.name + '.js'
                                                );
                                            
                                            //检查对应的文件是否存在，如果存在则引入文件
                                            if(m.pathInfo(dataPath).extension === '.js'){
                                                option.data = fws.require(dataPath);
                                            };
                                        };

                                        taskList.push(()=>{
                                            return new compile(option);
                                        });                                        
                                    };

                                    //如果有可执行的任务
                                    if(taskList.length){
                                        let f = async ()=>{
                                            for(let i=0,len=taskList.length; i<len; i++){
                                                let subTask = await taskList[i]();
                                                if(subTask instanceof Array){
                                                    subTask.forEach((item,index)=>{
                                                        if(item.status === 'success'){
                                                            m.tip.success(item.msg);
                                                        };
                                                    })
                                                };
                                                if(subTask.status === 'success'){
                                                    m.tip.success(subTask.msg);
                                                };
                                            };
                                            return {
                                                status:'success',
                                                msg:'文件监听编译完成'
                                            };
                                        };

                                        f().then(v => {
                                            //编译完成，如果有开启server则需要往前台提供刷新服务
                                            
                                        }).catch(e => {
                                            //编译遇到出错
                                            m.tip.error(e.msg);
                                            console.log(e.info);
                                        });
                                    };
                                };

                            switch (stats) {
                                //文件添加，如果文件为非公共文件，则将文件保存到数据中
                                case 'add':
                                    if(data[key] === undefined){
                                        data[key] = {};
                                    };
                                    if(!isPublic && !isData){
                                        data[key][filePath] = null;
                                    };

                                    //如果初始化状态已经完成，则添加的文件也会进行编译处理
                                    if(isInitCompile){
                                        compileFn();
                                    };
                                    
                                    //500ms内wacth无新增加文件响应将初始化状态设置为完成
                                    if(!isInitCompile){
                                        clearTimeout(temp);
                                        temp = setTimeout(()=>{
                                            isInitCompile = true;
                                        },500);
                                    };
                                break;
                                //文件修改
                                case 'change':
                                    compileFn();
                                break;
    
                                //文件删除
                                case 'unlink':
                                    try {
                                        delete data[key][filePath];
                                    } catch (error) {};
                                break;
                            }; 
                        };                                               
                    });

                    resolve({
                        status:'success',
                        msg:'开启文件监听服务'
                    });
                } catch (error) {
                    reject({
                        status:'error',
                        msg:'',
                        info:error
                    });
                };
            });
        });
        
        return tasks;
    }


};


module.exports = {
    regTask:{
        command:'[name]',
        description:'项目监听编译',
        option:[
            ['-b, --browse','浏览器访问项目'],
            ['-s, --server','开启http服务'],
            ['-f, --fast','快速模式，将不会预先编译项目']
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Watch
    }
};