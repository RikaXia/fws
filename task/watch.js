class Watch{
    constructor(projectPath,options){
        const _ts = this;
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

        _ts.path = projectPath || _ts.m.path.join(fws.cmdPath,'src');

        _ts.nonPublic = {};                             //保存非"_"开始的文件
        _ts.server = new _ts.m.autoRefresh();           //socket server

        _ts.init();
    }

    init(){
        const _ts = this;
        let path = _ts.path;

        //检查"src"目录是否存在，有则进行文件监听
        if(_ts.check()){
            //先清除dev目录再监听
            _ts.m.fs.remove(fws.devPath,err => {
                if(!err){
                    _ts.changeWatch();
                };
            });
        }else{
            _ts.m.tip.error(`错误， "${path}" 不是一个有效的fws项目目录，必须有一个"src"目录存在`);
        };
    }

    //检查当前目录是一个fws工程目录
    check(){
        const _ts = this;
        let path = _ts.path;

        return _ts.m.pathInfo(fws.srcPath).type === 'dir';
    }

    //编译项目指定类型的所有文件
    compileTypeFile(type){
        const _ts = this;
        for(let i in _ts.nonPublic[type]){
            new _ts.m.Compile({
                'src':i,            //输入文件
                'dist':undefined,   //输出模块，不指定由编译模块处理
                'debug':true,       //开启debug模式，会生成map并编译到dev目录
                'callback':(result)=>{
                    _ts.server.io.broadcast('refresh',result);
                }
            });
        };
    }

    //获取本机IP
    getLocalIp(){
        const _ts = this;

        let networkInfo = _ts.m.os.networkInterfaces();

        let ip;
        for(let i in networkInfo){
            let t = networkInfo[i].some((item,index)=>{
                if(item.family === 'IPv4' && item.address !== '127.0.0.1'){
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

    //文件修改监听
    changeWatch(){
        const _ts = this;
        let _path = _ts.path,
            w = _ts.m.chokidar.watch(_path,{persistent:true}),

            //检查类型是否可能存在公共文件引入的情况
            isLinkedFile = (fileType)=>{                
                let aLinked = ['.pug','.scss','.ts','.tsx','.jsx','.es','.es6'];
                return aLinked.some((item,index)=>{
                    return item === fileType;
                });
            },

            //检查是否可能为pug数据
            isPageData = (filePath)=>{
                let dataDir = _ts.m.path.join(fws.srcPath,'data','/');
                return filePath.indexOf(dataDir) === 0;
            };
        

        w.on('all',(stats,filePath)=>{            
            let fileType = _ts.m.path.extname(filePath).toLowerCase(),            //文件类型
                fileName = _ts.m.path.basename(filePath,fileType),                //文件名称
                filePrefix = fileName ? fileName.substr(0,1) : undefined;   //得取文件第一个字符，用于决定是否为公共文件
            
            //将非"_"开始的文件归类保存起来，监听到有"_"开始的公共文件有改动，则编译同类型所有文件
            if(stats === 'add' && filePrefix !== '_'){
                if(_ts.nonPublic[fileType] === undefined){
                    _ts.nonPublic[fileType] = {};
                };
                _ts.nonPublic[fileType][filePath] = null;
            };
                       
            if(stats === 'add' || stats === 'change'){
                //如果是数据文件，且是公共的，编译所有的jade文件
                if(isPageData(filePath) && (filePrefix === '_') && stats === 'change'){
                    _ts.compileTypeFile('.pug');
                    return;
                };
                if(isPageData(filePath) && stats === 'change'){
                    //编译与data所可能对应的页面
                    for(let i in _ts.nonPublic['.pug']){
                        let aPugName = i.split(_ts.m.path.sep),
                            pugName = aPugName[aPugName.length - 1].toLowerCase();
                        
                        if(pugName === fileName+'.pug'){
                            console.log(i);
                            new _ts.m.Compile({
                                'src':i,            //输入文件
                                'dist':undefined,   //输出模块，不指定由编译模块处理
                                'debug':true,       //开启debug模式，会生成map并编译到dev目录
                                'callback':(result)=>{
                                    _ts.server.io.broadcast('refresh',result);
                                }
                            });
                        };
                    };
                    return;
                };
                
                //文件首字母以"_"起始，且属于可能存在公共文件引入类型的，每次修改会编译项目内同类型所有文件
                if((filePrefix === '_') && isLinkedFile(fileType) && stats === 'change'){
                    _ts.compileTypeFile(fileType);
                }else{
                    new _ts.m.Compile({
                        'src':filePath,     //输入文件
                        'dist':undefined,   //输出模块，不指定由编译模块处理
                        'debug':true,       //开启debug模式，会生成map并编译到dev目录
                        'callback':(result)=>{
                            _ts.server.io.broadcast('refresh',result);
                        }
                    });
                };
            }else if(stats === 'unlink'){
                //删除_ts.noPublic的文件，避免不必要的编译处理
                delete _ts.nonPublic[fileType][filePath];
            };

            
        });

        //开启server
        _ts.m.openurl.open('http://'+_ts.getLocalIp()+':'+_ts.server.listenPort);
    }

    //isData
    // isData(path){
    //     const _ts = this;
    //     return path.indexOf(_ts.m.path.join(fws.cmdPath,'data/')) === 0;
    // }
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'项目监听编译',
        option:[
            //['-s, --server','开启http server']
        ],
        help:()=>{
            console.log('   补充说明:');
            console.log('   ------------------------------------------------------------');
            console.log('   暂无');
        },
        action:Watch
    }
};