class Build{
    constructor(srcPath,options){
        const _ts = this;

        let m = _ts.m = {
                fs:require('fs-extra'),
                path:require('path'),
                tip:require('../lib/tip'),
                pathInfo:require('../lib/getPathInfo'),
                isFwsDir:require('../lib/isFwsDir'),
                dirFilePath:require('../lib/getDirFilesPath')
            },
            config = _ts.config = {},
            option = _ts.option = options;
        
        config.src = fws.srcPath = typeof srcPath === 'string' ? m.path.join(fws.cmdPath,srcPath,'src'+m.path.sep) : fws.srcPath;
        config.dev = fws.devPath = m.path.join(config.src,'..','dev'+m.path.sep);
        config.dist = fws.distPath = m.path.join(config.src,'..','dist'+m.path.sep);

        //判断是否fws目录
        if(m.isFwsDir(config.src)){

        };
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
                    };
                };
                return '编译完成。';
            };
        
        f().then(v => {
            console.log(v);
        }).catch(e => {
            console.log(e);
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
        if(!isFwsDir && !option.noBackup){
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
        };

        //如果是fws项目则需要先初始化项目
        if(isFwsDir){
            //将初始化项目任务添加到任务列表
            let initCompileTasks = require('../lib/initCompile_dev')({
                src:fws.srcPath,
                dist:fws.devPath
            });

            tasks.push(...initCompileTasks);
        };

        //项目文件压缩
        let compressionTask = require('../lib/compressionTask')({
            src:isFwsDir ? fws.devPath : backupDirPath,
            dist:isFwsDir ? fws.distPath : projectDir
        });
        
        tasks.push(...compressionTask);

        return tasks;
    }
    
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'编译项目',
        option:[
            ['-n, --noBackup','不备份源文件']
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Build
    }
};