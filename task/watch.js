const path = require('path');
const chokidar = require('chokidar');
const fs = require('fs');

const tip = require('../lib/tip');                  //文字提示
const pathInfo = require('../lib/getPathInfo');     //判断文件或目录是否存在
const sass2css = require('../lib/sass2css');        //sass编译css
const pug2html = require('../lib/pug2html');        //pug编译html
const ts2js = require('../lib/ts2js');              //typescript编译js

const cwdPath = process.cwd();                      //当前路径






//let watch = ()=>{};
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

        return pathInfo(fws.srcPath === 'dir');
    }

    //文件修改监听
    changeWatch(){
        const _ts = this;
        let _path = _ts.path;

        let w = chokidar.watch(_path,{persistent:true});
        
        tip.highlight(`已经启动项目监听，按"ctrl + c"取消监听变动`);

        w.on('change',(filePath,stats)=>{

            let pt = pathInfo(filePath),
                fileType = pt.extension,
                fileName = pt.name;

            let dist = '';                

            switch (fileType) {
                case '.pug':
                    //编译jade文件
                    dist = path.join(fws.devPath,fileName+'.html');

                    //获取数据
                    let dataPath = path.join(fws.srcPath,'data',fileName+'.js'),
                        data = {};
                    if(pathInfo(dataPath.exports === '.js')){
                        data = fws.require(dataPath);
                    };
                    
                    pug2html(filePath,dist,data);
                break;

                case '.scss':
                    //编译scss文件
                    dist = path.join(fws.devPath,'css',fileName+'.css');                    
                    sass2css(filePath,dist,true);
                break;

                case '.ts':
                    //编译typescript文件
                    ts2js(filePath);
                break;

                case '.tsx':

                break;
            
                // default:
                //     tip.error(`${fileType}文件尚未指定编译任务。`)
                // break;
            }
        });


    }
};


module.exports = {
    regTask:{
        command:'[name]',
        description:'监听编译，该任务会自动检测Typescript、pug、scss的文件修改变化实时编译对应文件',
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