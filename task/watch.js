/// <reference path="../typings/globals/node/index.d.ts" />
'use strict';
class Watch{
    constructor(projectPath,options){
        const _ts = this;
        
        let m = _ts.m = {
                path:require('path'),
                chokidar:require('chokidar'),
                os:require('os'),
                fs:require('fs-extra'),
                autoRefresh:require('../lib/autoRefresh'),   //自动刷新
                openurl:require('openurl'),                  //打开前台页面
                tip:require('../lib/tip'),                   //文字提示
                pathInfo:require('../lib/getPathInfo'),      //判断文件或目录是否存在
                Compile:require('../lib/compile')            //编译文件
            },
            config = _ts.config = {},
            option = _ts.option = options;
        
        
        config.src = projectPath;
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
                    //console.log(task);
                };
                return '完成';
            };
        
        f().then(v => {
            console.log('OK',v);
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
        let tasks = [];

        //检查项目是否为一个fws项目
        tasks.push(()=>{
            return new Promise((resolve,reject)=>{
                if(_ts.isFwsProject(fws.srcPath)){
                    resolve({
                        status:'success',
                        msg:'检查目录为有效的 【FWS】 项目'
                    });
                }else{
                    reject({
                        status:'error',
                        msg:'不是有效的fws项目目录'
                    });
                };
            });
        });

        //清空开发目录文件
        if(!option.fast){
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{
                    m.fs.remove(fws.devPath,err => {
                        if(err){
                            reject({
                                status:'error',
                                msg:`删除失败  ${fws.devPath}`,
                                info:err
                            });
                        }else{
                            resolve({
                                status:'success',
                                msg:`清空 ${fws.devPath}`
                            });
                        };
                    });
                });
            });
        };

        //清空清灵图目录
        if(!option.fast){
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{
                    let fwsSpriteDataDir = m.path.join(fws.srcPath,'css','_fws','sprite','_spriteData');
                    if(m.pathInfo(fwsSpriteDataDir).type === 'dir'){
                        m.fs.remove(fwsSpriteDataDir,err => {
                            if(err){
                                reject({
                                    status:'error',
                                    msg:`删除失败  ${fwsSpriteDataDir}`,
                                    info:err
                                });
                            }else{
                                resolve({
                                    status:'success',
                                    msg:`清空 ${fwsSpriteDataDir}`
                                });
                            };
                        });
                    }else{
                        resolve({
                            status:'success',
                            msg:`清空 ${fwsSpriteDataDir}`
                        });
                    };
                });
            });
        };

        //初始化项目文件
        if(!option.fast){        
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{
                    let taskList = [],
                        data = _ts.getFilesData(fws.srcPath);

                    for(let i in data){
                        for(let ii in data[i]){
                            //编译选项
                            let option = {};

                            //如果是精灵图需要设置其输入/输出目录/sass输出目录，其它类型文件只需要设置输入或是输出项目即可
                            if(i === '_sprite'){
                                option.srcDir = ii;                                                                    //精灵图目录
                                option.distSpreiteDir = m.path.resolve(ii.replace(fws.srcPath,fws.devPath),'..');      //精灵图输出目录
                                option.distScssDir = m.path.join(fws.srcPath,'css','_fws','sprite');     //精灵图sass输出目录
                            }else{
                                option.src = ii;
                                option.dist = _ts.getDistPath(ii,true);
                            };
                            
                            //设置为开发模式
                            option.debug = true;

                            //获取与文件类型相对应的编译方法
                            let compile = _ts.getCompileFn(i);

                            //添加编译任务
                            taskList.push(()=>{
                                return new compile(option);
                            });
                        };
                    };

                    //将编译任务异步执行
                    let f = async ()=>{
                        for(let i=0,len=taskList.length; i < len; i++){
                            let subTask = await taskList[i]();
                            if(subTask instanceof Array){
                                subTask.forEach((item,index)=>{
                                    if(item.status === 'success'){
                                        m.tip.success(item.msg);
                                    };
                                });
                            };
                            if(subTask.status === 'success'){
                                m.tip.success(subTask.msg);
                            };
                        };
                        return {
                            status:'success',
                            msg:'项目初始化编译完成'
                        };
                    };

                    f().then(v => {
                        resolve(v);
                    }).catch(e => {
                        m.tip.error(v.msg);
                        reject(e);
                    });
                });
            });
        };

        //开启http服务
        if(option.server){
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{

                });
            });
        };

        //开启浏览服务
        if(option.browse){

        };
        
        return tasks;
    }

    /**
     * 获取文件输出路径
     * 
     * @param {any} src 
     * @param {any} isDebug 
     * @returns 
     * 
     * @memberOf Watch
     */
    getDistPath(src,isDebug){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        let correspondence = {
                '.pug':'.html',
                '.scss':'.css',
                '.ts':'.js',                
                '.tsx':'.jsx',
                '.jsx':'.js',
                '.es':'.js',
                '.es6':'.js'
            },
            fileType = m.path.extname(src).toLowerCase(),
            fileName = m.path.basename(src,fileType),

            //输出文件扩展名，如果上面的对应关系中有指定从对应关系中取，否则为原始扩展名
            outExtName = correspondence[fileType] === undefined ? fileType : correspondence[fileType],
            dist = '';
        
        if(isDebug){
            dist = m.path.join(m.path.dirname(src.replace(fws.srcPath,fws.devPath)),fileName + outExtName);
        }else{
            dist = m.path.join(m.path.dirname(src.replace(fws.srcPath,fws.distPath)),fileName + outExtName);
        };

        return dist;
    }

    /**
     * 获取编译方法
     * 
     * @param {object} option 
     * @param {string} type 文件扩展名，例如：“.svg”或“_sprite”精灵图
     * 
     * @memberOf Watch
     */
    getCompileFn(type){
        let api = require('../api'),
            copy = 1,
            fns = {
                '.pug':api.Pug2html,
                '.jade':api.Pug2html,
                '.scss':api.Sass2css,
                '.sass':api.Sass2css,
                '.ts':api.Ts2,
                '.tsx':api.Ts2,
                '.es':api.Ts2,
                '.es6':api.Ts2,
                '.jsx':api.Jsx2js,
                '_sprite':api.OutSprite
            };
        return fns[type] === undefined ? api.Copy : fns[type];
    }
    
    /**
     * 获取指定目录下的所有文件（不包含“_”开头的文件，如果是精灵图则只保存其所属目录）
     * 
     * @param {string} dirPath 目录路径
     * @param {array} ignoreDir 需要过滤的目录，例如“node_module”则会过滤掉“fws.srcPath/node_module”目录
     * @returns 
     * 
     * @memberOf Watch
     */
    getFilesData(dirPath,ignoreDir){
        const _ts = this,
            m = _ts.m;
            
        //先声明文件结构，以编译顺序能根据文件结构来
        let oFiles = {                
                '.pug':{},
                '.jade':{},
                '.ts':{},
                '.tsx':{},
                '.jsx':{},
                '.js':{},
                '.png':{},
                '.svg':{},
                '_sprite':{},
                '.scss':{},
                '.sass':{}
            },
            eachDir,
            
            //检查文件是否为需要过滤的目录内
            isIgnoreDir = (filePath)=>{
                ignoreDir = ignoreDir || [];
                return ignoreDir.some((item,index)=>{
                    //console.log('文件路径：',filePath);
                    return filePath.indexOf(m.path.join(fws.srcPath,item,m.path.sep)) === 0;
                });
            };

        (eachDir = (dir)=>{
            //检查，如果目录存在，则读取目录文件列表并逐层遍历
            let isDir = m.pathInfo(dir).type === 'dir';
            if(isDir){
                let files = m.fs.readdirSync(dir);

                files.forEach((item,index)=>{
                    let filePath = m.path.join(dir,item),
                        itemInfo = m.pathInfo(filePath);

                    if(itemInfo.type === 'dir' && itemInfo.name !== 'node_modules'){
                        eachDir(filePath)
                    }else if(itemInfo.type === 'file' && !isIgnoreDir(filePath)){

                        //如果文件是精灵图，保存其所属目录
                        let isSprite = _ts.isSprite(filePath);
                        if(isSprite){
                            oFiles['_sprite'][m.path.dirname(filePath)] = null;
                        }else{
                            //oFiles[itemInfo.extension].push(_ts.getFileInfo(filePath));
                            let fileInfo = _ts.getFileInfo(filePath);

                            //如果该类型文件没有出现过且不是以“_”开始的公共文件，那么创建一个空的对象用以存储文件列表
                            if(oFiles[itemInfo.extension] === undefined && !fileInfo.isPublic){
                                oFiles[itemInfo.extension] = {};
                            };

                            //如果文件不是公共文件（即以"_"开头的文件，则保存到对象中）
                            if(!fileInfo.isPublic){
                                oFiles[itemInfo.extension][filePath] = null;
                            }; 
                        };                        
                    };
                });
            };
        })(dirPath);

        return oFiles;
    }
    
    /**
     * 获取指定文件的相关信息
     * 
     * @param {string} filePath 
     * @returns 
     * 
     * @memberOf Watch
     */
    getFileInfo(filePath){
        const _ts = this,
            m = _ts.m,
            tempObj = {};
        
        tempObj.path = filePath;
        tempObj.type = m.path.extname(filePath).toLowerCase();          //文件扩展名，例如：".png"
        tempObj.name = m.path.basename(filePath,tempObj.type);          //文件名称不包含扩展名
        tempObj.isPublic = tempObj.name.substr(0,1) === '_';            //取文件名第一个字符,判断是否为公共文件 
        return tempObj; 
    }

    /**
     * 判断是否为精灵图
     * 
     * @param {string} filePath 图片路径
     * @returns 
     * 
     * @memberOf Watch
     */
    isSprite(filePath){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        let fileType = m.path.extname(filePath).toLowerCase(),          //文件类型
            isSpriteDir = (()=>{
            let adirNames = m.path.dirname(filePath).split(m.path.sep),
                dirName = adirNames[adirNames.length - 1].toLowerCase();
            return dirName.indexOf('_sprite') === 0;
        })(),
        isImg = fileType === '.png' || fileType === '.svg';

        return isSpriteDir && isImg;
    }

    /**
     * 判断是否为Fws项目目录
     * 
     * @param {string} dirPath 目录路径
     * @returns 
     * 
     * @memberOf Watch
     */
    isFwsProject(dirPath){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        return m.pathInfo(dirPath).type === 'dir';
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