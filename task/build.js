class Build{
    constructor(srcPath,options){
        const _ts = this;

        let m = _ts.m = {
                fs:require('fs-extra'),
                path:require('path'),
                tip:require('../lib/tip'),
                pathInfo:require('../lib/getPathInfo'),
                isFwsDir:require('../lib/isFwsDir'),
                dirFilePath:require('../lib/getDirFilesPath'),
                ReplaceTask:require('../lib/replaceTask'),
                compressionTask:require('../lib/compressionTask'),
                simplifyFont:require('../lib/simplifyFont'),
                getDirFilesPath:require('../lib/getDirFilesPath'),
                getImgInfo:require('../lib/getImgInfo'),
                fontmin:require('fontmin')
            },
            config = _ts.config = {},
            option = _ts.option = options;
        
        config.src = fws.srcPath = typeof srcPath === 'string' ? m.path.join(fws.cmdPath,srcPath,'src'+m.path.sep) : fws.srcPath;
        config.dev = fws.devPath = m.path.join(config.src,'..','dev'+m.path.sep);
        config.dist = fws.distPath = m.path.join(config.src,'..','dist'+m.path.sep);
    }

    //初始化
    init(){
        const _ts = this;

        let m = _ts.m,
            config = _ts.config,
            tasks = _ts.taskList(),
            f = async ()=>{
                for(let i=0,len=tasks.length; i<len; i++){
                    let task = await tasks[i]();
                    if(task.status === 'success'){
                        m.tip.success(task.msg);
                    }else if(task.status === 'part'){
                        console.log('');
                        console.log(task.msg);
                        console.log('----------------------------------------');                        
                    };
                };
                return '编译完成。';
            };
        
        f().then(v => {
            console.log('');
            m.tip.highlight('========================================');
            m.tip.highlight(v);
            m.tip.highlight('========================================');
        }).catch(e => {
            m.tip.error(e.msg);
            console.log('error',e);
        });
    }

    //taskList
    taskList(){
        const _ts = this;
        
        let m = _ts.m,
            config = _ts.config,
            option = _ts.option,
            tasks = [];
        
        //备份文件，如果不是fws项目目录且未强制启用不备份功能则需要备份文件
        let projectDir = m.path.join(config.src,'..'),                                  //项目目录
            backupDirName = m.pathInfo(projectDir).name+'_fwsBackup'+(+new Date),       //备份目录名
            backupDirPath = m.path.join(projectDir,'..',backupDirName),                 //备份目录路径
            isFwsDir = m.isFwsDir(projectDir);                                          //是否为fws项目目录
        
        //非fws项目需要先备份目录
        if(!isFwsDir){
            tasks.push(()=>{
                return new Promise((resolve,reject)=>{
                    //创建备份目录
                    m.fs.ensureDir(backupDirPath).then(v => {
                        //开始复制文件
                        m.fs.copy(projectDir,backupDirPath).then(v => {
                            resolve({
                                status:'success',
                                msg:`备份 ${projectDir} -> ${backupDirPath}`,
                                data:backupDirPath
                            });
                        }).catch(e => {
                            reject({
                                status:'error',
                                msg:`${projectDir} 备份失败`,
                                info:e
                            });
                        });
                    }).catch(e => {
                        reject({
                            status:'error',
                            msg:`${backupDirPath} 创建失败`,
                            infor:e
                        });
                    });                    
                });
            });
        }else{
            //初始化项目
            tasks.push(_ts.insertPart('初始化：'));

            //将初始化项目任务添加到任务列表
            let initCompileTasks = require('../lib/initCompile_dev')({
                src:fws.srcPath,
                dist:fws.devPath
            });
            tasks.push(...initCompileTasks);


            //项目编译关键字替换
            let replaceRule = fws.config.distReplace;
            if(replaceRule){
                tasks.push(_ts.insertPart('关键字匹配替换：'));

                //得到目录内的所有文件url路径
                let replaceTask = new m.ReplaceTask({
                    src:fws.devPath,
                    rule:replaceRule
                });
                tasks.push(replaceTask);
            };
        };
        
        //项目文件压缩
        tasks.push(_ts.insertPart('文件压缩处理：'));
        let compressionTask = m.compressionTask({
            src:isFwsDir ? fws.devPath : backupDirPath,
            dist:isFwsDir ? fws.distPath : projectDir,
            isMobile:option.mobile,                     //是否为移动端
            isBeautify:option.beautify                  //是否格式化代码
        });        
        tasks.push(...compressionTask);

        //css Base6压缩
        tasks.push(_ts.insertPart('CSS inline-image Base64编码压缩'));
        tasks.push(()=>{
            return new Promise((resolve,reject)=>{
                //读取目录中所有文件
                let distDirFiles = m.getDirFilesPath({
                    srcDir:config.dist,
                    ignoreDir:[],           //不排除任何目录
                    ignore_:false           //不排除以"_"开始的文件
                }),
                distImgsData = {},          //dist/images目录图片数据
                cssFiles = (()=>{
                    let cssListObj = distDirFiles['.css'],
                        temp = [];
                    if(cssListObj){
                        for(let i in cssListObj){
                            temp.push(i);
                        };
                    };
                    return temp;
                })(),
                imgFiles = (()=>{
                    let temp = [];

                    //遍历以几类图片列表，将文件属于dist/images目录中的图片筛选出来
                    ['jpg','jpeg','png','gif'].forEach((item)=>{
                        item = distDirFiles['.'+item];
                        if(item){
                            for(let i in item){
                                if(i.indexOf(m.path.join(config.dist,'images',m.path.sep)) === 0){
                                    temp.push(i);
                                };  
                            };
                        };
                    });
                    return temp;    
                })(),
                getImgsDataTask = (()=>{
                    let task = [];
                    if(imgFiles.length){
                        imgFiles.forEach((item)=>{
                            task.push(m.getImgInfo(item));
                        });
                        return Promise.all(task);
                    }else{
                        return undefined;
                    };
                })();

                if(!cssFiles.length){
                    resolve({
                        status:'success',
                        msg:'无有效的CSS文件需要进行压缩'
                    });
                };

                if(getImgsDataTask){
                    getImgsDataTask.then(v => {
                        //将dist/images目录内图片数据组织到成为JSON格式
                        v.forEach((item)=>{
                            if(item.status === 'success'){
                                let data = item.data,
                                    key = data.path.replace(config.dist,'../').replace(/\\/g,'/');
                                distImgsData[key] = data;
                            };
                        });

                        cssFiles.forEach((item)=>{
                            let css = m.fs.readFileSync(item).toString(),
                                newCss;
                            
                            for(let i in distImgsData){
                                //将src/images中的数据(base64)替换为dist/images中优化过后的数据(base64)
                                if(fws.ImgsData[i] && distImgsData[i] && fws.ImgsData[i]['base64'] && distImgsData[i]['base64']){

                                    //使用数据分开再合并法，拼接新的CSS
                                    newCss = (()=>{
                                        let c = css.split(fws.ImgsData[i]['base64']),
                                            temp = '';
                                        c.forEach((item,index)=>{
                                            if(index < c.length - 1){
                                                //temp += item + distImgsData[i]['base64'];
                                                temp += item + distImgsData[i]['base64'];
                                            }else{
                                                temp += item;
                                            }; 
                                        });
                                        return temp;
                                    })();
                                };
                            };

                            //如果新压缩的CSS小于
                            if(newCss.length < css.length){
                                //创建目录并写入文件
                                let distDir = m.path.dirname(item);
                                m.fs.ensureDir(distDir,err => {
                                    if(err){
                                        reject({
                                            status:'error',
                                            msg:`创建失败 ${distDir}`,
                                            info:err
                                        });
                                    };
                                    
                                    //写入css文件
                                    try {
                                        m.fs.writeFileSync(item,newCss);
                                    } catch (err) {
                                        reject({
                                            status:'error',
                                            msg:`写入失败 ${item}`,
                                            distPath:item,
                                            info:err
                                        });
                                    };
                                });
                            };
                        });
                        resolve({
                            status:'success',
                            msg:'项目CSS inline-image 压缩处理完成'
                        }); 
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:config.dist+'目录无有效图片需要进行base64转换'
                    });
                };
            });
        })
        

        //字体文件精简
        if(isFwsDir){
            tasks.push(_ts.insertPart('字体文件精简：'));        
            let simplifyFont = require('../lib/fontMin');
            tasks.push(
                simplifyFont({
                    src:isFwsDir ? fws.devPath : backupDirPath,
                    dist:isFwsDir ? fws.distPath : projectDir
                })
            ); 
        };
               
        return tasks;
    }

    //insertPart
    insertPart(partTitle){
        return ()=>{
            return new Promise((resolve,reject)=>{
                resolve({
                    status:'part',
                    msg:partTitle
                })
            });
        }
    }
    
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'编译项目',
        option:[
            ['-m, --mobile','移动端模式，css样式将不会添加全部前缀'],
            ['-b, --beautify','css、js文件格式化，不被压缩 ']
        ],
        help:()=>{
            console.log('');
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Build
    }
};