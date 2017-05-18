const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs-extra');

const tip = require('../lib/tip');                  //文字提示
const pathInfo = require('../lib/getPathInfo');     //判断文件或目录是否存在
const Compile = require('../lib/compile');          //编译文件

class Watch{
    constructor(projectPath,options){
        const _ts = this;

        _ts.path = projectPath || path.join(fws.cmdPath,'src');

        _ts.nonPublic = {};                         //保存非"_"开始的文件

        _ts.init();
    }

    init(){
        const _ts = this;
        let path = _ts.path;

        //检查"src"目录是否存在，有则进行文件监听
        if(_ts.check()){
            //先清除dev目录再监听
            fs.remove(fws.devPath,err => {
                if(!err){
                    _ts.changeWatch();
                };
            });
        }else{
            tip.error(`错误， "${path}" 不是一个有效的fws项目目录，必须有一个"src"目录存在`);
        };
    }

    //检查当前目录是一个fws工程目录
    check(){
        const _ts = this;
        let path = _ts.path;

        return pathInfo(fws.srcPath).type === 'dir';
    }

    //编译项目指定类型的所有文件
    compileTypeFile(type){
        const _ts = this;
        for(let i in _ts.nonPublic[type]){
            new Compile({
                'src':i,            //输入文件
                'dist':undefined,   //输出模块，不指定由编译模块处理
                'debug':true        //开启debug模式，会生成map并编译到dev目录
            });
        };
    }

    //文件修改监听
    changeWatch(){
        const _ts = this;
        let _path = _ts.path,
            w = chokidar.watch(_path,{persistent:true}),

            //检查类型是否可能存在公共文件引入的情况
            isLinkedFile = (fileType)=>{                
                let aLinked = ['.pug','.scss','.ts','.tsx','.jsx','.es','.es6'];
                return aLinked.some((item,index)=>{
                    return item === fileType;
                });
            },

            //检查是否可能为pug数据
            isPageData = (filePath)=>{
                let dataDir = path.join(fws.srcPath,'data','/');
                return filePath.indexOf(dataDir) === 0;
            };
        

        w.on('all',(stats,filePath)=>{
            let fileType = path.extname(filePath).toLowerCase(),            //文件类型
                fileName = path.basename(filePath,fileType),                //文件名称
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
                
                //文件首字母以"_"起始，且属于可能存在公共文件引入类型的，每次修改会编译项目内同类型所有文件
                if((filePrefix === '_') && isLinkedFile(fileType) && stats === 'change'){
                    _ts.compileTypeFile(fileType);
                }else{
                    new Compile({
                        'src':filePath,     //输入文件
                        'dist':undefined,   //输出模块，不指定由编译模块处理
                        'debug':true        //开启debug模式，会生成map并编译到dev目录
                    });
                };
            }else if(stats === 'unlink'){
                //删除_ts.noPublic的文件，避免不必要的编译处理
                delete _ts.nonPublic[fileType][filePath];
            };
        });

        //开启server
    }
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'项目监听编译',
        option:[
            ['-s, --server','开启http server']
        ],
        help:()=>{
            //额外的帮助
        },
        action:Watch
    }
};