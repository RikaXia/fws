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
            m = _ts.m;

        let f = async ()=>{
            let pList = _ts.start();

            for(let i of pList){
                i.then((v)=>{
                    if(typeof v === 'string'){
                        m.tip.success(v)
                    };
                },(e)=>{});
                await i;
            };

            return '成功';
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
            config = _ts.config,
            m = _ts.m;

        let taskList = [];

        //检查项目目录
        taskList.push(new Promise((resolve,reject)=>{
            if(_ts.check()){
                resolve('检查项目目录通过');
            }else{
                reject('不是有效的 FWS 项目目录');
            };
        }));

        //清除dev目录并开启项目监听
        taskList.push(new Promise((resolve,reject)=>{
            _ts.m.fs.remove(fws.devPath,err => {
                if(err){
                    reject(err);
                }else{             
                    resolve('清空项目 dev 目录');
                };
            });
        }));

        taskList.push(new Promise((resolve,reject)=>{
            _ts.changeWatch();
            resolve('开启文件监听服务');
        }));

        //开启server
        taskList.push(new Promise((resolve,reject)=>{
            resolve(true);
        }));

        //浏览项目
        taskList.push(new Promise((resolve,reject)=>{
            if(config.browse){
                _ts.m.openurl.open('http://'+_ts.getLocalIp()+':'+_ts.server.listenPort);
            };
            resolve('浏览页面')
        }));

        //

        return taskList;
    }

    /**
     * 文件修改监听
     */
    changeWatch(){
        const _ts = this;
        
        let m = _ts.m,
            c = _ts.config,
            w = m.chokidar.watch(c.path,{persistent:true}),

            //检查类型是否可能存在公共文件引入的情况
            isImportFile = (fileType)=>{
                let importType = ['pug','scss','ts','tsx','jsx','es','es6'];
                return importType.some((item,index)=>{
                    return item === '.'+fileType;
                });
            },

            //检查是否可能为pug数据
            isPageData = (filePath)=>{
                let dataDir = _ts.m.path.join(fws.srcPath,'data','/');
                return filePath.indexOf(dataDir) === 0;
            };
        
        
        // w.on('all',(stats,filePath)=>{
        //     console.log(_ts.getFileInfo(filePath))
            
        // });

        console.time('a');
        console.log(_ts.getDirFileData(c.path));
        console.timeEnd('a');
    }

    /**
     * 编译方法
     */
    compile(){

    }

    /**
     * 获取路径文件信息
     */
    getFileInfo(filePath){
        const _ts = this,
            m = _ts.m,
            tempObj = {};
        
        tempObj.path = filePath;
        tempObj.type = m.path.extname(filePath).toLowerCase();                          //文件类型
        tempObj.name = m.path.basename(filePath,tempObj.type);                          //文件名称
        tempObj.isPublic = tempObj.name.substr(0,1) === '_';                            //取文件名第一个字符,判断是否为公共文件 
        return tempObj; 
    }

    /**
     * 获取目录文件结构
     */
    getDirFileData(dirPath){
        const _ts = this;
        let oFiles = {},
            eachDir;
        (eachDir = (dir)=>{
            let dirInfo = _ts.m.pathInfo(dir);
            if(dirInfo.type === 'dir'){
                let files = _ts.m.fs.readdirSync(dir);

                files.forEach((item,index)=>{
                    let filePath = _ts.m.path.join(dir,item),
                        itemInfo = _ts.m.pathInfo(filePath);
                    
                    if(itemInfo.type === 'dir' && itemInfo.name != 'node_modules'){
                        eachDir(filePath)
                    }else if(itemInfo.type === 'file'){
                        if(oFiles[itemInfo.extension] === undefined){
                            oFiles[itemInfo.extension] = [];
                        };
                        oFiles[itemInfo.extension].push(_ts.getFileInfo(filePath));
                    };
                });
            };
        })(dirPath);

        return oFiles;
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