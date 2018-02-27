class Test{
    constructor(name,options){
        const _ts = this;

        //自定义模块
        _ts.m = {
            path:require('path'),
            fs:require('fs-extra'),
            os:require('os'),
            url:require('url'),
            svn:require('svn-spawn')
        };

        _ts.name = name;
        _ts.option = options;

        //svn地址
        _ts.config = {
            'mobile':'https://sypt.4399svn.com/svn/Platform_Doc/page/4399gdc/',
            'pc':'https://gdc.4399svn.com/svn/yypt/page/'
        };

        _ts.client = new _ts.m.svn({
            //cwd:'/Users/fan/Desktop/p1234',
            username:'liyong2',
            password:'4df8a7cd',
            noAuthCache:true
        });
    }

    init(){
        const _ts = this,
            m = _ts.m;

        let data = {};

        

        // _ts.client.cmd(['checkout','https://sypt.4399svn.com/svn/Platform_Doc/page/4399gdc/2018/02/p1212/','/Users/fan/Desktop/p1234','--username=liyong2','--password=4df8a7cd'],(err,data)=>{
        //     console.log('错误',err);
        // });

        // _ts.client.cmd(['info','https://sypt.4399svn.com/svn/Platform_Doc/page/4399gdc/2018/02/p1234/'],(err,data)=>{
        //     if(err){
        //         console.log('错误',err,data);
        //         console.log('错误的其它操作')
        //     }else{
        //         console.log('正确',err,data)
        //     };
        // });

        _ts.checkIsExist().then(v => {
            console.log('地址存在',v);
        }).catch(e => {
            console.log('出错信息',e)
            _ts.client.cmd(['mkdir','-m','工具创建目录','https://gdc.4399svn.com/svn/yypt/page/2019/02/p123/'],(err,data)=>{
                if(err){
                    console.log('创建目录失败');
                }else{
                    console.log('检出并提交更新');
                };
            })
            //console.log('地址无效',e);
        });


        //_ts.update();

        

    }

    update(){
        const _ts = this;
        _ts.client.update((err,data)=>{
            console.log(err);
        })
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

    //获取当前项目的svn地址
    getSvnPath(){

    }

    //检查当前目录在SVN上是否存在
    checkIsExist(){
        const _ts = this,
            m = _ts.m,
            config = _ts.config;
        
        let currentDirName = fws.cmdPath.replace(m.path.join(fws.cmdPath,'..','/'),''),                         //得到当前目录名称
            svnType = currentDirName[0] === 'p' ? 'pc' : currentDirName[0] === 'm' ? 'mobile' : undefined,      //得到SVN类型
            date = new Date(),
            year = date.getFullYear()+'',
            month = date.getMonth() + 1,
            svnUrl = `${config[svnType]}${year}/${month < 10 ? '0'+month : month}/${currentDirName}/`,          //当前目录的SVN路径为项目类型SVN地址+年+月+当前目录名称
            aUrl = [year,month < 10 ? '0'+month : month,currentDirName],
            checks = [],
            path = config[svnType];

        for(let i=0,len=aUrl.length; i<len; i++){
            let item = aUrl[i],
                result;

            path += `${item}/`;
            
            checks.push(_ts.checkSvn(path));
        };

        return Promise.all(checks);
    }

    //检查Svn地址是否有效
    checkSvn(svnUrl){
        const _ts = this;
        return new Promise((resolve,reject)=>{
            _ts.client.cmd(['info',svnUrl],(err,data)=>{
                if(err){
                    reject({
                        status:'error',
                        msg:'svn地址无效',
                        path:svnUrl,
                        data:err
                    });
                }else{
                    resolve({
                        status:'success',
                        msg:'svn地址有效',
                        path:svnUrl,
                        data:''
                    });
                };
            });
        });
    }
}

module.exports = {
    regTask:{
        command:'[name]',
        description:'推送文件到SVN服务器',
        option:[
            //['-p, --param [type]','任务参数（可选）']
            ['-p, --param <type>','任务参数（必选）']
        ],
        help:()=>{
            console.log('');
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Test
    },
    fun:()=>{}
};