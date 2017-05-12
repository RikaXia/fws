const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs');

const tip = require('../lib/tip');                  //文字提示
const pathInfo = require('../lib/getPathInfo');     //判断文件或目录是否存在
const compile = require('../lib/compile');          //编译文件

const cwdPath = process.cwd();                      //当前路径



//检查当前项目有哪些文件
class watch{
    constructor(projectPath){
        const _ts = this;

        _ts.path = projectPath || path.join(fws.cmdPath,'src');

        //非公共文件保存至该对象,当公共文件有修改时,会遍历相对类型的所有文件进行编译
        _ts.nonPublic = {
            'pug':{

            },
            'sass':{

            },            
            'ts':{

            },
            'tsx':{

            }
        };

        _ts.init();
    }

    init(){
        const _ts = this;
        let path = _ts.path;

        //检查"src"目录是否存在，有则进行文件监听
        if(_ts.check()){
             _ts.changeWatch();
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
            compile(i);
        };
    }

    //文件修改监听
    changeWatch(){
        const _ts = this;
        let _path = _ts.path;

        let w = chokidar.watch(_path,{persistent:true}),

            //检查路径是否为data目录文件
            isDataFile = (sPath)=>{
                let dataDirPath = path.join(fws.srcPath,'data','/');
                return sPath.indexOf(dataDirPath) === 0;
            },

            //检查路径是否为忽略编译的目录
            isIgnoreCompileDir = (sPath)=>{
                let ignoreDir = fws.config.ignoreCompileDir,
                    aPathList = path.dirname(sPath).split(path.sep);              

                if(ignoreDir.length){
                    return ignoreDir.some((item,index)=>{
                        return aPathList.some((_item,_index)=>{
                            return item === _item;
                        });
                    });
                };
                return false;
            };


        w.on('all',(stats,filePath)=>{
            let fileType = path.extname(filePath).toLowerCase(),
                fileName = path.basename(filePath,fileType),

                notIgnoreDir = !isIgnoreCompileDir(filePath),

                //得取文件第一个字符，用于决定是否为公共文件
                prefix = fileName ? fileName.substr(0,1) : undefined;
            
            //将非公共文件保存至nonPublic
            if(stats === 'add' && notIgnoreDir){
                switch (fileType){
                    case '.pug':
                        _ts.nonPublic.pug[filePath] = null;
                    break;

                    case '.scss':
                        _ts.nonPublic.sass[filePath] = null;
                    break;

                    case '.ts':
                        _ts.nonPublic.ts[filePath] = null;
                    break;

                    case '.tsx':
                        _ts.nonPublic.tsx[filePath] = null;
                    break;
                };
            };           
            
            //当文件状态是新增加或有修改变化的时候 且 不在忽略列表时，编译对应的文件
            if(stats === 'add' || stats === 'change'){
                //如果修改的是公共文件，则编译同类型所有文件
                if(prefix === '_'){
                    switch (fileType){
                        case '.pug':
                            _ts.compileTypeFile('pug');
                        break;

                        case '.scss':
                            _ts.compileTypeFile('scss');
                        break;
                            
                        case '.ts':
                            _ts.compileTypeFile('ts');
                        break;

                        case '.tsx':
                            _ts.compileTypeFile('tsx');
                        break;

                        case '.js':
                            compile(filePath);
                        break;
                    };
                }else{
                    compile(filePath);                                       
                };
            }else if(stats === 'unlink'){
                //及时删除nonPublic,避免不必要的编译处理
                if(notIgnoreDir){
                    switch (fileType){
                        case '.pug':
                            delete _ts.nonPublic.pug[filePath];
                        break;

                        case '.scss':
                            delete _ts.nonPublic.sass[filePath];
                        break;

                        case '.ts':
                            delete _ts.nonPublic.ts[filePath];
                        break;

                        case '.tsx':
                            delete _ts.nonPublic.tsx[filePath];
                        break;
                    };
                };
                

                //删除旧的已经编译的对应文件

            };

            //如果修改的data目录下的.js文件，则编译pug的对应文件
            if(stats === 'change' && fileType === '.js' && isDataFile(filePath)){
                //修改的是公共数据，编译所有jade文件，否则只编译与其文件名相对应的文件
                if(prefix === '_'){
                    for(let i in _ts.nonPublic.pug){
                        compile(i);
                    };
                }else{
                    for(let i in _ts.nonPublic.pug){
                        let pugName = path.basename(i);                        
                        if(pugName === fileName+'.pug'){
                            compile(i);
                        };
                    };
                };
            };
            
            
        });


    }
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'项目监听编译',
        // option:[
        //     ['-p, --pc','初始化一个pc项目'],
        //     ['-m, --mobile','初始化一个移动端项目']
        // ],
        help:()=>{
            //额外的帮助
        },
        action:watch
    }
};