class SvnCommit{
    constructor(name,options){
        const _ts = this;

        //自定义模块
        _ts.m = {
            path:require('path'),
            fs:require('fs-extra'),
            os:require('os'),
            url:require('url'),
            svn:require('svn-spawn'),
            clipboardy:require('clipboardy'),
            zip:require('../lib/zip'),
            pathInfo:require('../lib/getPathInfo'),
            tip:require('../lib/tip')
        };

        _ts.name = name;
        _ts.option = options;

        //记录时间，用于提交代码的路径拼接
        let time = new Date();
        _ts.time = {
            year:time.getFullYear()+'',
            month:(()=>{
                let m = time.getMonth() + 1;
                return m < 10 ? '0'+m : m;
            })()
        };

        let currentDirName = fws.cmdPath.replace(_ts.m.path.join(fws.cmdPath,'..','/'),''),                         //得到当前目录名称
            projectType = currentDirName[0] === 'p' ? 'pc' : currentDirName[0] === 'm' ? 'mobile' : undefined;      //得到项目类型

        projectType = _ts.option.pc ? 'pc' : _ts.option.mobile ? 'mobile' : projectType;

        //svn地址
        _ts.config = {
            svns:{
                mobile:'https://sypt.4399svn.com/svn/Platform_Doc/page/4399gdc/',
                pc:'https://gdc.4399svn.com/svn/yypt/page/'
            },
            preview:{
                mobile:'http://gdc.4399svn.com/svn/yypt/page/',
                pc:'http://static.4399gdc.com/yypt/'
            },
            currentDirName:currentDirName,
            projectType:projectType
        };

        //svn配置
        let option = {};
        option.cwd = fws.cmdPath;
        if(fws.config.svn[projectType]){
            option.username = fws.config.svn[projectType].username;
            option.password = fws.config.svn[projectType].password;
        };
        
        option.noAuthCache = true;

        _ts.client = new _ts.m.svn(option);
    }

    init(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        if(config.projectType === undefined){
            m.tip.error('当前目录名不符合GDC FE Ground 项目命名规范，强行提交代码请手动指定项目类型');
            return;
        };

        let data = {},
            urlInfo = _ts.getUrlInfo(),
            svnPath = urlInfo.svnUrl,
            preview = urlInfo.preview,
            f = async()=>{
                let svnInfo = await _ts.getSvnInfo(),
                    svnMkdir,
                    checkout,
                    update,
                    zipDist,
                    addLocal,
                    commit,
                    clipboardText,
                    srcPath,
                    outPath;

                if(svnInfo.data === 'none'){
                    //无svn信息则在远程创建目录并检出到当前工作目录
                    svnMkdir = await _ts.svnMkdir(svnPath);
                    if(svnMkdir.status === 'error'){
                        m.tip.error('远程创建Svn目录失败');
                        throw new Error(svnMkdir);
                    };

                    checkout = await _ts.checkout(svnPath);
                    if(checkout.status === 'success'){
                        m.tip.success('检出远程目录到本地');
                    };
                }else{
                    //获取svn首次提交的日期，并更新相关路径信息
                    let svnFirstSubmmitDate = svnInfo.data.commit.date.split('-');
                    if(svnFirstSubmmitDate.length){
                        _ts.time.year = svnFirstSubmmitDate[0];
                        _ts.time.month = svnFirstSubmmitDate[1];

                        urlInfo = _ts.getUrlInfo();
                        svnPath = urlInfo.svnUrl;
                        preview = urlInfo.preview;
                    };
                    
                    let localSvnVer = +svnInfo.data.$.revision,     //得到本地SVN版本号
                        remotelySvnVer = +(await _ts.checkSvn(svnInfo.data.url)).data.Revision;     //得到远程SVN版本号
                    
                    //远程版本较新时则更新远程版本到本地
                    if(remotelySvnVer > localSvnVer){
                        update = await _ts.update();
                        if(update.status === 'success'){
                            m.tip.success('更新本地代码版本');
                        };
                    }; 
                };

                //如果有开启打包选项，并且dist目录存在，则打包dist目录
                if(_ts.option.zip && m.fs.existsSync(fws.distPath)){
                    srcPath = fws.distPath;
                    outPath = m.path.join(fws.cmdPath,`${config.currentDirName}--${m.path.basename(srcPath)}.tar`);
                    
                    zipDist = await m.zip(srcPath,outPath);
                    if(zipDist.status === 'success'){
                        m.tip.success('Dist目录压缩完成');
                    };
                };
                
                //添加文件
                addLocal = await _ts.addLocal();
                if(addLocal.status === 'success'){
                    m.tip.success('添加所有文件到仓库');
                };

                //提交文件
                commit = await _ts.commit(`由 ${fws.config.author} 通过 fws push 任务提交`);
                if(commit.status === 'success'){
                    m.tip.success('提交文件成功');
                };

                //提交完成之后再刷新本地SVN版本信息
                update = await _ts.update();
                if(update.status === 'success'){
                    m.tip.success('更新本地代码版本');
                };

                //压缩包路径（有开启压缩项，且dist目录存在）
                let zipFileInfo = (()=>{
                    if(_ts.option.zip && m.fs.existsSync(fws.distPath)){
                        let zipFileName = m.path.basename(outPath),
                            time = _ts.time,
                            zipFilePath = `${config.preview[config.projectType]}${time.year}/${time.month}/${config.currentDirName}/${zipFileName}`;
                        return `

**下载：**
${zipFilePath}
                        `;
                    }else{
                        return '';
                    };
                })();

                clipboardText = `
## 项目文件

**预览：**
${urlInfo.previewUrl}
${zipFileInfo}

**SVN：**
${svnPath}

------
By 4399 [GDC](http://www.4399gdc.com) @${fws.config.author}, From [FWS](https://sbfkcel.github.io/fws/)
`;
                m.clipboardy.writeSync(clipboardText);

                m.tip.highlight(`
以下信息已经复制到剪切板：
==========`);
                console.log(`${clipboardText}`);
                return commit;
            };

        f().then(v => {
            m.tip.success('代码提交任务执行完成');
        }).catch(e => {
            m.tip.error(v.msg);
        });
    }
    
    //获取目录内所有文件路径（包括目录）
    getDirFilesPath(path){
        const _ts = this,
            m = _ts.m;
        let data = {
            },
            eathDir;

        (eathDir = (dir)=>{
            let isDir = m.pathInfo(dir).type === 'dir';
            if(isDir){
                let files = m.fs.readdirSync(dir);
                files.forEach((item,index)=>{
                    let filePath = m.path.join(dir,item),
                        itemInfo = m.pathInfo(filePath);
                    if(item !== '.svn'){
                        if(itemInfo.type === 'dir'){
                            filePath = m.path.join(filePath,m.path.sep);
                            eathDir(filePath);
                        };
                        data[filePath] = null;
                        
                    };
                    
                });
            };
        })(path);
        return data;
    }

    //获取Svn信息
    getSvnInfo(){
        const _ts = this;
        return new Promise((resolve,reject)=>{
            try {
                _ts.client.getInfo((err,data)=>{
                    if(err){
                        resolve({
                            status:'error',
                            msg:`${fws.cmdPath} 无svn信息`,
                            data:'none'
                        });
                    }else{
                        resolve({
                            status:'success',
                            msg:`${fws.cmdPath} 获取svn信息成功`,
                            data:data
                        });
                    };
                });
            } catch (error) {
                reject({
                    status:'error',
                    msg:`获取svn信息错误`,
                    data:error
                });
            };  
        });
    }

    checkout(svnUrl){
        const _ts = this;

        return new Promise((resolve,reject)=>{
            _ts.client.checkout(svnUrl,(err,data)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:`${svnUrl} 检出失败`,
                        data:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:`${svnUrl} 检出成功`,
                        data:data
                    });
                };
            });
        });
    }

    //svn远程创建目录
    svnMkdir(svnUrl){
        const _ts = this,
            m = _ts.m,
            config = _ts.config,
            svnKey = config.projectType;
            
        //检查是否为部门Svn库
        return (async()=>{
            if(!svnKey){
                throw new Error({
                    status:'error',
                    msg:`${svnUrl} 可能不是有效的GDC项目SVN地址`
                });
            };

            //得到SVN远程从根目录到子目录的目录名称，例如:[2018,02,p123]
            let svnPathDirs = (()=>{
                let temp = [],
                    dirs = svnUrl.replace(config.svns[svnKey],'').split('/');
                dirs.forEach(item => {
                    if(item !== ''){
                        temp.push(item);
                    };
                });

                return temp;
            })();

            let svnTempUrl = config.svns[svnKey];
            //依次检查远程目录是否存在，如果不存在则创建
            for(let i=0,len=svnPathDirs.length; i<len; i++){
                let item = svnPathDirs[i];

                //拼装svn地址
                svnTempUrl += `${item}/`;

                //检查远程是否存在该地址，如果地址不存在则创建
                let check = await _ts.checkSvn(svnTempUrl);

                //检查所有已经都已经存在则直接返回成功
                if(check.status === 'success' && i===len-1){
                    return {
                        status:'success',
                        msg:`${svnUrl} 目录已经存在`
                    };
                };

                //目录不存在，则创建
                if(check.status === 'error'){
                    let mkdir = await new Promise((resolve,reject)=>{
                        _ts.client.cmd(['mkdir','-m','工具创建目录',svnTempUrl],(err,data)=>{
                            if(err){
                                resolve({
                                    status:'error',
                                    msg:`${svnTempUrl} 目录创建失败`,
                                    data:err
                                });
                            }else{
                                resolve({
                                    status:'success',
                                    msg:`${svnTempUrl} 目录创建成功`
                                });
                            };
                        });
                    });

                    if(mkdir.status === 'error'){
                        return {
                            status:'error',
                            msg:`${mkdir.msg}`
                        };
                    };

                    if(i===len-1 && mkdir.status === 'success'){
                        return {
                            status:'success',
                            msg:`${svnUrl} 目录创建完成`
                        };
                    };
                };
            };
        })(); 
    }

    //svn添加文件
    addLocal(){
        const _ts = this;

        return new Promise((resolve,reject)=>{
            _ts.client.addLocal((err,data)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:'svn添加文件失败',
                        data:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:'svn添加文件成功'
                    });
                };
            });
        });
    }

    //svn提交文件
    commit(remark){
        const _ts = this;
        return new Promise((resolve,reject)=>{
            _ts.client.commit(remark,(err,data)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:'svn提交失败',
                        data:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:'svn提交成功'
                    });
                };
            });
        });
    }

    //删除
    delete(path){
        const _ts = this;
        return new Promise((resolve,reject)=>{
            _ts.client.del(path,(err,data)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:`${path} 从svn移除失败`,
                        data:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:`${path} 从svn移除成功`,
                        data:data
                    });
                };
            });
        })
    }

    //svn更新
    update(){
        const _ts = this;

        return new Promise((resolve,reject)=>{
            _ts.client.update((err,data)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:'svn更新失败',
                        data:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:'svn更新成功'
                    });
                };
            });
        });
    }
    

    //获取并创建fws临时交换目录
    getUserDir(){
        const _ts = this,
            m = _ts.m;

        let dirPath = m.os.homedir();
        dirPath = m.path.join(dirPath,'fws','svnTemp');

        m.fs.ensureDirSync(dirPath);
        return dirPath;
    }

    //获取当前项目的的相关URL及信息
    getUrlInfo(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;

        let currentDirName = config.currentDirName,                         //得到当前目录名称
            projectType = config.projectType,                                       //得到SVN类型
            time = _ts.time,
            year = time.year,
            month = time.month,
            svnUrl = `${config.svns[projectType]}${year}/${month}/${currentDirName}/`,          //当前目录的SVN路径为项目类型SVN地址
            previewUrl = `${config.preview[projectType]}${year}/${month}/${currentDirName}/dist/`;
        
        return projectType ? {
            svnUrl:svnUrl,
            previewUrl:previewUrl
        } : projectType;
    }

    //检查Svn地址是否有效
    checkSvn(svnUrl){
        const _ts = this;
        return new Promise((resolve,reject)=>{
            try {
                _ts.client.cmd(['info',svnUrl],(err,data)=>{
                    if(err){
                        resolve({
                            status:'error',
                            msg:'svn地址无效',
                            path:svnUrl,
                            data:err
                        });
                    }else{
                        let temp = {};
                        
                        //将获取到的远程SVN信息格式化为对象
                        data = data.split('\n');
                        data.forEach((item,index)=>{
                            item = item.split(': ');
                            let key = item[0].replace(/ /ig,''),
                                val = item[1];
                            if(key && val){
                                temp[key] = val;
                            };
                        });
                        
                        resolve({
                            status:'success',
                            msg:'svn地址有效',
                            path:svnUrl,
                            data:temp
                        });
                    };
                });
            } catch (error) {
                reject({
                    status:'error',
                    msg:`检查svn信息 ${svnUrl} 出现错误`,
                    path:svnUrl,
                    data:error
                });
            };  
        });
    }
}

module.exports = {
    regTask:{
        command:'[name]',
        description:'推送文件到SVN服务器',
        option:[
            ['-p, --pc [type]','指定项目为pc类型'],
            ['-m, --mobile [type]','指定项目为mobile类型'],
            ['-z, --zip [zip]','打包dist目录，并生成压缩包路径到剪切板']
        ],
        help:()=>{
            console.log('');
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:SvnCommit
    },
    fun:()=>{}
};