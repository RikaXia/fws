const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs');

const tip = require('../lib/tip');                  //文字提示
const pathInfo = require('../lib/getPathInfo');     //判断文件或目录是否存在
const sass2css = require('../lib/sass2css');        //sass编译css
const pug2html = require('../lib/pug2html');        //pug编译html
const ts2js = require('../lib/ts2js');              //typescript编译js

const cwdPath = process.cwd();                      //当前路径



class watch{
    constructor(projectPath){
        const _ts = this;

        _ts.path = projectPath || fws.cmdPath;

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

    //文件修改监听
    changeWatch(){
        const _ts = this;
        let _path = _ts.path;

        let w = chokidar.watch(_path,{persistent:true});
        
        tip.highlight(`已经启动项目监听，按"ctrl + c"取消监听变动`);

        w.on('all',(stats,filePath)=>{

            let pt = pathInfo(filePath),
                fileType = pt.extension,
                fileName = pt.name,

                //得取文件第一个字符，用于决定是否为公共文件
                prefix = fileName ? fileName.substr(0,1) : undefined,
                dist = '',

                //判断文件类型是否属于项目监听的目录
                isTypeDir = (dirName)=>{
                    let re = path.join(path.join(fws.srcPath,dirName,'/'));
                    return filePath.indexOf(re) === 0;
                };
            
            //当文件状态是新增加或有修改变化的时候编译对应的文件
            if(stats === 'add' || stats === 'change'){
                switch (fileType) {
                    case '.pug':
                        //编译jade文件
                        dist = path.join(fws.devPath,fileName+'.html');

                        //获取数据
                        let dataPath = path.join(fws.srcPath,'data',fileName+'.js'),
                            data = {};
                        
                        if(pathInfo(dataPath).extension === '.js'){
                            data = fws.require(dataPath);
                        };
                        
                        pug2html(filePath,dist,data);
                    break;

                    case '.scss':
                        //编译scss文件
                        if(isTypeDir('sass')){
                            if(prefix === '_'){

                            }else{
                                dist = path.join(fws.devPath,'css',fileName+'.css');                    
                                sass2css(filePath,dist,true);
                            };
                        };
                        
                    break;

                    case '.ts':case '.tsx':
                        //编译typescript文件                        

                        let isTsDir = isTypeDir('ts'),
                            isTsxDir = isTypeDir('tsx');


                        //检查是否为ts或tsx目录的文件
                        if(isTsDir || isTsxDir){

                            //如果是公共文件有修改变化，所有ts、tsx文件都需要重新编译
                            if(prefix === '_' && stats === 'change'){
                                let fileDir = (fileType === '.ts') ? path.join(fws.srcPath,'ts') : path.join(fws.srcPath,'tsx');
                                

                                let eachDir,
                                    callback = (s)=>{console.log(s)};

                                (eachDir = (dirPath,callback)=>{
                                    //判断传入的路径是否为目录
                                    if(pathInfo(dirPath).type === 'dir'){
                                        let dirFiles = fs.readdirSync(dirPath);

                                        dirFiles.forEach((item,index)=>{
                                            console.log(item);
                                        });
                                    };

                                })(fileDir,callback);

                                // let dirFiles = fs.readdirSync(fileDir);

                                // dirFiles.forEach((item,index)=>{

                                // });
                                

                            }
                            //非公共文件新增、修改需要进行编译
                            else if(prefix !== '_'){
                                dist = isTsDir ? path.join(fws.devPath,'js',fileName+'.js') : path.join(fws.devPath,'jsx',fileName+'.js');                            
                                ts2js(filePath,dist);
                            };
                        };                        
                    break;

                    case '.js':
                        //数据文件变动编译对应的jade文件

                        //检查是否为数据目录的文件
                        if(isTypeDir('data')){
                            if(prefix === '_'){
                                //如果是公共文件，则是编译所有的pug文件
                                let pugDir = path.join(fws.srcPath,'pug');

                                //检查项目目录是否有pug文件
                                if(pathInfo(pugDir).type === 'dir'){
                                    //读取"src/pug"目录所有文件
                                    let pugDirList = fs.readdirSync(pugDir),
                                        pugList = [];
                                    
                                    //筛选出不以"_"开头的pug文件
                                    pugDirList.forEach((item,index)=>{
                                        let isPug = (()=>{
                                            let s = item.substr(0,1),
                                                e = item.substr(item.length - 4,4);
                                            
                                            return !(s === '_')  && (e === '.pug');
                                        })();

                                        if(isPug){
                                            pugList.push(item);
                                        };
                                    });

                                    pugList.forEach((item,index)=>{
                                        let pugFilePath = path.join(fws.srcPath,'pug',item),
                                            name = item.substr(0,item.length - 4),
                                            dataPath = path.join(fws.srcPath,'data',name+'.js'),
                                            data = {};
                                        

                                        //设置输出路径
                                        dist = path.join(fws.devPath,name+'.html');
                                        
                                        //如果对应的数据文件存在，则引入数据
                                        if(pathInfo(dataPath).type === 'file'){
                                            data = fws.require(dataPath);
                                        };
                                        
                                        pug2html(pugFilePath,dist,data);
                                    });
                                };

                            }else{
                                //检查是否有对应的pug文件存在,有则编译该文件即可
                                let pugFilePath = path.join(fws.srcPath,'pug',fileName+'.pug'),
                                    isExist = pathInfo(pugFilePath).type === 'file',
                                    data = fws.require(filePath);

                                dist = path.join(fws.devPath,fileName+'.html');                   
                                
                                if(isExist){
                                    pug2html(pugFilePath,dist,data);
                                };                            
                            };
                        };
                    break;
                
                    default:
                        let isImg = (()=>{
                            return fileType === '.png' || fileType === '.jpg' || fileType === '.gif';
                        })();
                        if(isImg){
                            //图片改变处理
                            //console.log('图片处理');
                        };


                        //tip.error(`${fileType}文件尚未指定编译任务。`)
                    break;
                };
            }
            //文件状态为删除的时候，需要删除与之对应编译出来的目标文件
            else if(stats === 'unlink'){
                switch(fileType){
                    case '.pug':
                        //删除与.pug对应的html

                    break;

                    case '.scss':
                        //删除与.scss对应的css、css.map
                    break;

                    case '.ts':case '.tsx':
                        //删除与typescript对应的js、js.map

                    break;

                    default:

                    break;
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