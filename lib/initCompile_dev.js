/**
 * 初始化项目
 * 
 * @param {string} filePath 文件路径
 * 
 * @memberOf Watch
 */
module.exports = (option)=>{
    const {fs,path,tip,pathInfo,getDirFilesPath,getFileInfo,getCompileFn,getDistPath,isFilter,getImgInfo,updateImgData,isSprite} = {
        fs:require('fs-extra'),
        path:require('path'),
        tip:require('./tip'),
        pathInfo:require('./getPathInfo'),
        getDirFilesPath:require('./getDirFilesPath'),      //获取目录文件数据
        getFileInfo:require('./getFileInfo'),              //获取指定文件的相关信息
        getCompileFn:require('./getCompileFn'),            //根据文件类型来获取编译方法
        getDistPath:require('./getDistPath'),
        isFilter:require('./isFilter'),
        getImgInfo:require('./getImgInfo'),
        updateImgData:require('./updateImgData'),
        isSprite:require('./isSprite')
    };

    let src = option.src,
        dist = option.dist,
        srcDirFiles = getDirFilesPath({
            srcDir:src
            // ignoreDir:['node_modules'],           //默认会排除'node_modules'的目录
            // ignore_:true                          //默认会排以"_"开始的文件公共文件
        }),
        tasks = [];
    
    //清空开发目录文件
    tasks.push(()=>{
        return new Promise((resolve,reject)=>{
            fs.remove(dist,err => {
                if(err){
                    reject({
                        status:'error',
                        msg:`删除失败  ${dist}`,
                        info:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:`清空 ${dist}`
                    });
                };
            });
        });
    });

    //清空清灵图目录
    tasks.push(()=>{
        return new Promise((resolve,reject)=>{
            let fwsSpriteDataDir = path.join(src,'css','_fws','sprite','_spriteData');
            if(pathInfo(fwsSpriteDataDir).type === 'dir'){
                fs.remove(fwsSpriteDataDir,err => {
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
    
    //初始化图片资源数据
    tasks.push(()=>{
        return new Promise((resolve,reject)=>{
            let imgInfoTasks = [],
                imgInfoData = fws.ImgsData = {},
                data = srcDirFiles,
                imgInfoDataString;

            //遍历项目文件，如果是图片的则获取图片信息添加至任务列表
            for(let i in data){
                let isImgList = ['jpg','jpeg','png','gif'].some((item)=>{
                    return '.'+item === i;
                }),
                _isSprite = isSprite(i);
                
                if(isImgList && !_isSprite){
                    for(let ii in data[i]){
                        let isImgDir = ii.indexOf(path.join(fws.srcPath,'images',path.sep)) === 0;
                        if(isImgDir){
                            imgInfoTasks.push(getImgInfo(ii));
                        };
                    };
                };
            };

            Promise.all(imgInfoTasks).then(v => {
                //遍历图片任务数据，并生成sass数据文件写入
                v.forEach((item,index)=>{
                    let data = item.data,
                        key = data.path.replace(fws.srcPath,'../').replace(/\\/g,'/');
                    imgInfoData[key] = {};
                    for(let i in data){
                        imgInfoData[key][i] = data[i];
                        //imgInfoData[key]['base64'] = 'base64';
                    };
                });

                //将JSON对象转换成SASS对象并完成图片数据文件更新
                updateImgData(imgInfoData).then(v => {
                    resolve(v);
                }).catch(e => {
                    reject(e);
                });

            }).catch(e => {
                reject({
                    status:'error',
                    msg:`图片数据初始化失败`,
                    info:e
                });
            });
        });
    });

    //初始化项目文件
    tasks.push(()=>{
        return new Promise((resolve,reject)=>{
            let taskList = [],
                data = srcDirFiles;

            //删除vue类型文件，因为初始化时只需要编译入口的js文件即可
            delete(data['.vue']);
            

            //初始化项目文件
            for(let i in data){
                for(let ii in data[i]){
                    //编译选项
                    let option = {};
                    //如果是精灵图需要设置其输入/输出目录/sass输出目录，其它类型文件只需要设置输入或是输出项目即可
                    if(i === '_sprite'){
                        option.srcDir = ii;                                                                    //精灵图目录
                        option.distSpreiteDir = path.resolve(ii.replace(src,dist),'..');      //精灵图输出目录
                        option.distScssDir = path.join(src,'css','_fws','sprite');                   //精灵图sass输出目录
                    }else{
                        option.src = ii;
                        option.dist = getDistPath(ii,true);
                    };
                    

                    //如果是jade文件，需要试图从项目data目录中寻找对应的数据文件
                    if(i === '.jade' || i === '.pug'){
                        
                        //得到文件的信息，文件名，文件类型，是否为公共文件
                        let fileInfo = getFileInfo(ii),

                            //根据jade|pug文件路径得到相对应的数据文件路径
                            dataPath = ii.replace(src,path.join(src,'data'+path.sep));                                
                        dataPath = path.join(path.dirname(dataPath),fileInfo.name+'.js');

                        //检查对应的文件是否存在，如果存在则引入文件
                        if(pathInfo(dataPath).extension === '.js'){
                            option.data = fws.require(dataPath);
                        };
                    };
                    
                    //设置为开发模式
                    option.debug = true;

                    //获取与文件类型相对应的编译方法
                    let compile = getCompileFn(i);

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
                                tip.success(item.msg);
                            };
                        });
                    };
                    if(subTask.status === 'success'){
                        tip.success(subTask.msg);
                    };
                };
                return {
                    status:'success',
                    msg:'项目初始化编译完成'
                };
            };

            f().then(v => {
                //isInitCompile = true;
                resolve(v);
            }).catch(e => {
                tip.error(e.msg);
                reject(e);
            });
        });
    });
    

    return tasks;
}