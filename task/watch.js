const path = require('path');
const chokidar = require('chokidar');

const tip = require('../lib/tip');                  //文字提示
const isExist = require('../lib/isExist');          //判断文件或目录是否存在

const cwdPath = process.cwd();                      //当前路径

class watch{
    constructor(projectPath){
        const _ts = this;

        _ts.path = projectPath || cwdPath;
        _ts.srcPath = path.join(_ts.path,'/src');   //src目录
        _ts.devPath = path.join(_ts.path,'/dev');   //dev目录
        _ts.distPath = path.join(_ts.path,'/dist'); //dist目录

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

        return isExist('src',path);
    }

    //文件修改监听
    changeWatch(){
        const _ts = this;
        let _path = _ts.path;

        let w = chokidar.watch(_path,{persistent:true});
        
        tip.highlight(`已经启动项目监听，按"ctrl + c"取消监听变动`);

        w.on('change',(path,stats)=>{
            console.log(path);
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